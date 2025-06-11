'use client';

import Agent from "@/components/Agent";
import Loading from "@/components/loading";
import ManualInterviewForm from "@/components/ManualInterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useEffect, useState } from "react";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(true);
  

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (!user){
    return <Loading />;
  }


  return (
    <>

    
      <div className="relative">
        
        {/* Main content is never blurred or pointer-events-none, so spacing/gap is always preserved */}
        {/* <Agent
          userName={user?.name!}
          userId={user?.id}
          profileImage={user?.profileImage}
          type="generate"
        /> */}

        <ManualInterviewForm userId={user?.id} />
      </div>
    </>
  );
};

export default Page;