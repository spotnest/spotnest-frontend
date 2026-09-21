"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/src/store/hook";
import { signInSucceeded } from "@/src/store/slices/authSlice";
import { getCurrentUser } from "@/src/modules/auth/services/authServices";

function OAuthCallbackContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const completeAuthentication = async () => {
      try {
        /**
         * The browser automatically sends the HttpOnly accessToken cookie
         * that was set by the backend during the Google OAuth callback.
         */
        const user = await getCurrentUser();

        if (!isMounted) return;

        if (!user) {
          setError("Google authentication failed. No user profile received.");
          return;
        }

        dispatch(signInSucceeded(user));

        if (user.role === "owner") {
          router.replace("/owner/dashboard");
        } else if (user.role === "admin") {
          router.replace("/dashboard");
        } else {
          router.replace("/user/dashboard");
        }
      } catch {
        if (isMounted) {
          setError("Google authentication failed. Please try again.");
        }
      }
    };

    void completeAuthentication();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[#1C1B1A]">
            Authentication failed
          </h1>

          <p className="mt-3 text-[#6F6B65]">{error}</p>

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
        <p className="mt-4 text-[#6F6B65]">Signing you in...</p>
      </div>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#6C4CE6]/30 border-t-[#6C4CE6]" />
            <p className="mt-4 text-[#6F6B65]">Signing you in...</p>
          </div>
        </main>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}