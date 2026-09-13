import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Login() {
  useEffect(() => {
    window.location.replace(getLoginUrl());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <p className="text-gray-300">Redirecting to sign in…</p>
    </div>
  );
}
