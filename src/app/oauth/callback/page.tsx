"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";
import { getCurrentUser } from "@/src/modules/auth/services/authServices";
import { useAppDispatch } from "@/src/store/hook";
import { signInSucceeded } from "@/src/store/slices/authSlice";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const oauthError = searchParams.get("error");
  const [error, setError] = useState("");

  useEffect(() => {
    if (oauthError) {
      return;
    }

    let isMounted = true;

    const processOAuthSession = async () => {
      try {
        const response = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        const user = response?.user;

        if (!user) {
          setError("Google authentication failed. No active session found.");
          return;
        }

        dispatch(signInSucceeded(user));

        const targetRoute = getDashboardRouteForRole(user.role);

        router.replace(targetRoute);
      } catch {
        if (isMounted) {
          setError("Google authentication failed. Please try again.");
        }
      }
    };

    void processOAuthSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router, oauthError]);

  const displayError =
    oauthError || error
      ? oauthError || error
      : "";

  if (displayError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[#1C1B1A]">
            Authentication failed
          </h1>

          <p className="mt-3 text-[#6F6B65]">{displayError}</p>

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

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#6C4CE6]/30 border-t-[#6C4CE6]" />

            <p className="mt-4 text-[#6F6B65]">
              Signing you in...
            </p>
          </div>
        </main>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}