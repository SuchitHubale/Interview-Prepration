import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface RouteParams {
  params: {
    id: string;
  };
}

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

const Feedback = async ({ params }: RouteParams) => {
  const { id } = params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <section className="section-feedback max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Interview Feedback
        </h1>
        <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dayjs(feedback?.createdAt).format("MMM D, YYYY")}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Overall Score: <span className={`font-bold ${getScoreColor(feedback?.totalScore || 0)}`}>{feedback?.totalScore}/100</span></span>
          </div>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Summary
        </h2>
        <p className="text-lg">{feedback?.finalAssessment}</p>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {feedback?.categoryScores?.map((category: CategoryScore, index: number) => (
          <div key={index} className={`${getScoreBackground(category.score)} p-6 rounded-xl shadow-sm`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                  {category.score}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full ${
                  category.score >= 80 ? 'bg-green-500' : 
                  category.score >= 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${category.score}%` }}
              ></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{category.comment}</p>
          </div>
        ))}
      </div>

      {/* Strengths & Improvements Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Strengths */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Strengths
          </h2>
          <ul className="space-y-3">
            {feedback?.strengths?.map((strength: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Areas for Improvement
          </h2>
          <ul className="space-y-3">
            {feedback?.areasForImprovement?.map((area: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Your Action Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback?.actionPlan?.map((action: string, index: number) => (
            <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full font-bold">
                {index + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Practice Again</span>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
