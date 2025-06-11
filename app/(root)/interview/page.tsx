'use client';

import Loading from "@/components/loading";
import ManualInterviewForm from "@/components/ManualInterviewForm";
import ResumeUploadForm from '@/components/ResumeUploadForm';
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, PenTool } from "lucide-react";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showResumeForm, setShowResumeForm] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (!user) {
    return <Loading />;
  }

  if (showManualForm) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowManualForm(false)}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <ManualInterviewForm userId={user?.id} />
      </div>
    );
  }

  if (showResumeForm) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowResumeForm(false)}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <ResumeUploadForm userId={user?.id} />
      </div>
    );
  }

  return (
    <div className="rounded-lg pb-15 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Simple Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Create Interview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose how you want to create your interview
          </p>
        </div>

        {/* Simplified Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              onClick={() => setShowManualForm(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <PenTool className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Manual Creation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                Create interview by specifying your requirements
              </p>
            </div>
          </motion.div>

          {/* Resume Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              onClick={() => setShowResumeForm(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Upload Resume
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                Upload your resume for AI-powered questions
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Page;