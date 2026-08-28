"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, ReactNode } from "react";
import { AuthContext } from "@/helpers/authContext";

const AuthProtected = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  });

  return <>{children}</>;
};

export default AuthProtected;