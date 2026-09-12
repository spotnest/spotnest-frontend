"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");

    if (!token || !refreshToken || !userParam) {
      setError("Google authentication failed. Missing authentication data.");
      return;
    }

    try {
      const user = JSON.parse(userParam);

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      router.replace("/dashboard");
    } catch {
      setError("Google authentication failed. Please try again.");
    }
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[#1C1B1A]">
            Authentication failed
          </h1>

          <p className="mt-3 text-[#6F6B65]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-xl bg-[#6C4CE6] px-6 py-3 font-semibold text-white transition hover:bg-[#5738C7]"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#6C4CE6]/30 border-t-[#6C4CE6]" />

        <p className="mt-4 text-[#6F6B65]">
          Signing you in...
        </p>
      </div>
    </main>
  );
}