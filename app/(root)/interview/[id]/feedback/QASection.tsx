"use client";

import { useState } from "react";

interface QAData {
  question: string;
  userAnswer: string;
  aiAnswer: string;
  suggestion: string;
}

export const QASection = ({ qaData }: { qaData: QAData[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl mb-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
          <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Interview Q&A Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
          Click on any question to view detailed analysis and suggestions
        </p>
      </div>

      <div className="space-y-4">
        {qaData?.map((qa: QAData, index: number) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Question Header - Always Visible */}
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-semibold">
                  Q{index + 1}
                </div>
                <h3 className="text-left text-lg font-medium text-gray-900 dark:text-gray-100">
                  {qa.question}
                </h3>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Details Section - Hidden by Default */}
            {openIndex === index && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                {/* Answers Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* User's Answer */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">Your Answer</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{qa.userAnswer}</p>
                  </div>
                  
                  {/* AI's Answer */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h4 className="font-medium text-green-700 dark:text-green-300">AI Suggested Answer</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{qa.aiAnswer}</p>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="font-medium text-purple-700 dark:text-purple-300">Tips for Improvement</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{qa.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>      
    </div>
  );
}; 