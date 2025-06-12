'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createWorker, Worker } from 'tesseract.js';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

interface ResumeUploadFormProps {
  userId: string;
}

const ResumeUploadForm = ({ userId }: ResumeUploadFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [pdfWorker, setPdfWorker] = useState<any>(null);
  const [tesseractWorker, setTesseractWorker] = useState<Worker | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedType, setSelectedType] = useState('Technical');
  const [customRole, setCustomRole] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [duration, setDuration] = useState('');

  const roles = [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Other'
  ];

  const interviewTypes = [
    'Technical',
    'Behavioral',
    'System Design',
    'Problem Solving',
    'Leadership'
  ];

  // Calculate number of questions based on duration
  const calculateQuestions = (duration: number) => {
    // Assuming 5-7 minutes per question
    const minQuestions = Math.floor(duration / 7);
    const maxQuestions = Math.floor(duration / 5);
    return { minQuestions, maxQuestions };
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDuration(value);
    
    // Only show question estimate if we have a valid number
    if (value !== '' && !isNaN(parseInt(value))) {
      const numValue = parseInt(value);
      if (numValue >= 15 && numValue <= 120) {
        const { minQuestions, maxQuestions } = calculateQuestions(numValue);
        toast(`This will generate ${minQuestions}-${maxQuestions} questions`, {
          icon: '💡',
          duration: 3000,
        });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initialize PDF.js worker only on the client side
    if (typeof window !== 'undefined' && !isInitialized) {
      // Set the worker source to the local worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      setPdfWorker(pdfjsLib);

      // Initialize Tesseract worker
      const initTesseract = async () => {
        try {
          const worker = await createWorker('eng');
          if (isMounted) {
            setTesseractWorker(worker);
            setIsInitialized(true);
            toast.success('OCR system initialized successfully');
          }
        } catch (error) {
          console.error('Error initializing Tesseract:', error);
          if (isMounted) {
            toast.error('Failed to initialize OCR system. Please refresh the page.');
          }
        }
      };

      initTesseract();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (tesseractWorker) {
        tesseractWorker.terminate();
      }
    };
  }, [isInitialized]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setFile(file);
      toast.success('File uploaded successfully');
      setShowRoleSelection(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (role !== 'Other') {
      setCustomRole('');
    }
  };

  const convertPdfToImage = async (pdfFile: File): Promise<Blob> => {
    if (!pdfWorker) {
      throw new Error('PDF worker not initialized');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfWorker.getDocument({ data: arrayBuffer }).promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set scale for better quality
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context!,
      viewport: viewport
    }).promise;
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const processResume = async () => {
    if (!file || !tesseractWorker) {
      toast.error('Please upload a file first');
      return;
    }

    if (!selectedRole && !customRole) {
      toast.error('Please select or enter a role');
      return;
    }

    // Validate duration
    const durationValue = parseInt(duration);
    if (isNaN(durationValue)) {
      toast.error('Please enter a valid duration');
      return;
    }
    if (durationValue < 15 || durationValue > 120) {
      toast.error('Interview duration must be between 15 and 120 minutes');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    const processingToast = toast.loading('Processing your resume...');

    try {
      // Convert PDF to image if needed
      let imageData;
      if (file.type === 'application/pdf') {
        if (!pdfWorker) {
          throw new Error('PDF worker not initialized');
        }
        toast.loading('Converting PDF to image...', { id: processingToast });
        const blob = await convertPdfToImage(file);
        imageData = await blob.arrayBuffer();
        toast.success('PDF converted successfully', { id: processingToast });
      } else {
        // For images, we can process directly
        imageData = await file.arrayBuffer();
      }

      // Perform OCR
      toast.loading('Extracting text from resume...', { id: processingToast });
      const { data: { text } } = await tesseractWorker.recognize(imageData as any);
      
      // Extract information from the text
      toast.loading('Analyzing resume content...', { id: processingToast });
      const extractedInfo = extractInfoFromText(text);

      // Calculate number of questions based on duration
      const { minQuestions, maxQuestions } = calculateQuestions(durationValue);
      const averageQuestions = Math.round((minQuestions + maxQuestions) / 2);

      // Generate interview
      toast.loading('Generating interview questions...', { id: processingToast });
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...extractedInfo,
          role: selectedRole === 'Other' ? customRole : selectedRole,
          type: selectedType,
          userid: userId,
          amount: averageQuestions,
        }),
      });

      const data = await response.json();

      if (data.success && data.interviewId) {
        toast.success('Interview generated successfully!', { id: processingToast });
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error(data.message || 'Failed to create interview');
      }

    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process resume. Please try again.', { id: processingToast });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const extractInfoFromText = (text: string) => {
    // This is a basic implementation. You might want to use more sophisticated
    // NLP techniques or regex patterns to extract information more accurately
    
    const lines = text.split('\n');
    
    // Extract role (usually in the first few lines)
    const role = lines[0]?.trim() || 'Software Developer';
    
    // Extract skills (look for common tech keywords)
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'typescript',
      'angular', 'vue', 'aws', 'azure', 'docker', 'kubernetes'
    ];
    const skills = techKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    // Determine level based on experience keywords
    const experienceKeywords = {
      senior: ['senior', 'lead', 'principal', 'architect'],
      mid: ['mid', 'intermediate', 'experienced'],
      junior: ['junior', 'entry', 'graduate']
    };

    let level = 'Mid-level';
    for (const [key, keywords] of Object.entries(experienceKeywords)) {
      if (keywords.some(k => text.toLowerCase().includes(k))) {
        level = key === 'senior' ? 'Senior' : 
                key === 'mid' ? 'Mid-level' : 'Junior';
        break;
      }
    }

    return {
      role,
      level,
      type: 'Technical',
      techstack: skills.join(', '),
      amount: 5,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Upload Your Resume
      </h2>

      {!showRoleSelection ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-700 dark:text-gray-300">
              {isDragActive
                ? 'Drop your resume here'
                : 'Drag and drop your resume, or click to select'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PDF, PNG, JPG (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Selected file: {file?.name}
            </p>
            <button
              onClick={() => {
                setFile(null);
                setShowRoleSelection(false);
                setSelectedRole('');
                setCustomRole('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Change file
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-2 text-sm rounded-lg border transition-colors
                      ${selectedRole === role
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {selectedRole === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Custom Role
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter your role"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interviewTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-2 text-sm rounded-lg border transition-colors
                      ${selectedType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                step="15"
                value={duration}
                onChange={handleDurationChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="Enter duration (15-120 minutes)"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter duration between 15-120 minutes (approximately 5-7 minutes per question)
              </p>
            </div>

            <motion.button
              onClick={processResume}
              disabled={isLoading || !tesseractWorker || (!selectedRole && !customRole)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Resume...
                </span>
              ) : (
                'Generate Interview'
              )}
            </motion.button>
          </div>
        </div>
      )}

      {progress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Processing: {progress}%
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ResumeUploadForm; 