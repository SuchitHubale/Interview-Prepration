'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ManualInterviewFormProps {
  userId: string;
}

const ManualInterviewForm = ({ userId }: ManualInterviewFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'Junior',
    type: 'Technical',
    techstack: '',
    duration: '' as string | number,
  });

  // Calculate number of questions based on duration
  const calculateQuestions = (duration: number) => {
    // Assuming 5-7 minutes per question
    const minQuestions = Math.floor(duration / 7);
    const maxQuestions = Math.floor(duration / 5);
    return { minQuestions, maxQuestions };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.role.trim()) {
      toast.error('Please enter a role');
      return;
    }
    if (!formData.techstack.trim()) {
      toast.error('Please enter at least one technology');
      return;
    }
    
    // Validate duration
    const duration = parseInt(formData.duration as any);
    if (isNaN(duration)) {
      toast.error('Please enter a valid duration');
      return;
    }
    if (duration < 15 || duration > 120) {
      toast.error('Interview duration must be between 15 and 120 minutes');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating your interview...');

    try {
      const { minQuestions, maxQuestions } = calculateQuestions(duration);
      const averageQuestions = Math.round((minQuestions + maxQuestions) / 2);

      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          techstack: formData.techstack.split(',').map(tech => tech.trim()),
          userid: userId,
          amount: averageQuestions,
        }),
      });

      const data = await response.json();

      if (data.success && data.interviewId) {
        toast.success('Interview created successfully!', { id: loadingToast });
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error(data.message || 'Failed to create interview');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create interview. Please try again.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, techstack: value });
    
    // Show warning if too many technologies
    const techCount = value.split(',').filter(tech => tech.trim()).length;
    if (techCount > 5) {
      toast('Consider focusing on 3-5 key technologies for better results', {
        icon: '💡',
        duration: 4000,
      });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, duration: value === '' ? '' : parseInt(value) });
    
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Create Your Interview
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Frontend Developer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={formData.techstack}
              onChange={handleTechStackChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., React, TypeScript, Next.js"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter technologies separated by commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Interview Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              step="15"
              value={formData.duration}
              onChange={handleDurationChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              placeholder="Enter duration (15-120 minutes)"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter duration between 15-120 minutes (approximately 5-7 minutes per question)
            </p>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Interview...
            </span>
          ) : (
            'Create Interview'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ManualInterviewForm;