import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { Userui } from "@/components/ui/Userui";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">Intervue.AI</h2>
        </Link>
        <Link href="/profile">
        <div className="flex items-center gap-2 p-1 border border-gray-200 hover:border-white rounded-full shadow-sm hover:shadow transition-all duration-200">
          <Userui width={32} height={32} className=" p-1 rounded-full transition-colors duration-200"/>
        </div>
      </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
