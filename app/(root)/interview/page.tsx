'use client';

import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useEffect, useState } from "react";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(true);
  

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (!user){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }


  return (
    <>
      <h3>Interview generation</h3>

      {/* Notice overlay and blurred background */}
      <div className="relative">
        {/* Blurred background and overlay only when notice is open */}
        {showNotice && (
          <>
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40 backdrop-blur-md bg-black/30 transition-all duration-300"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-fadeIn">
                <h4 className="text-lg font-semibold text-blue-600 mb-2 text-center">
                  Notice: Interview Generation Issue
                </h4>
                <p className="text-gray-700 dark:text-gray-200 text-center mb-4">
                  The Vapi workflow has changed its process to gathering information,
                  and the interview is currently{" "}
                  <span className="font-semibold text-red-500">not generated</span>
                  .
                  <br />
                  <br />
                  You can try this process, but at the end, the interview will not be
                  generated because of the Vapi voice assistant issue.
                  <br />
                  <br />
                  <span className="font-semibold text-blue-500">
                    You can try the generated interview, and I will be fixing the
                    problem very soon.
                    If you have any questions, please contact me on <a href="https://linkedin.com/in/SuchitHubale" target="_blank">linkdin</a>  
                  </span>
                </p>
                <button
                  className="cursor-pointer mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                  onClick={() => setShowNotice(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
        {/* Main content is never blurred or pointer-events-none, so spacing/gap is always preserved */}
        <Agent
          userName={user?.name!}
          userId={user?.id}
          profileImage={user?.profileImage}
          type="generate"
        />
      </div>
    </>
  );
};

export default Page;
