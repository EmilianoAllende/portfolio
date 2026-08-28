"use client";

import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

interface Props {
  role: "employee" | "client";
  label?: string;
}

export default function GoogleLoginButton({ role, label }: Props) {
  const router = useRouter();

  const handleGoogleLogin = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${role}/google?type=${role}`
    );
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded mt-4 hover:bg-[#f0f2f1] cursor-pointer"
    >
      <FcGoogle size={20} />
      <span>{label || "Continuar con Google"}</span>
    </button>
  );
}
