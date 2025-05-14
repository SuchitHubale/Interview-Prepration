import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { profile } from "console";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview generation</h3>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        profileImage={user?.profileImage}
        type="generate"
      />
    </>
  );
};

export default Page;
