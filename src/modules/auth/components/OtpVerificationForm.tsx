"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Mail, ArrowRight } from "lucide-react";

import {
  verifyEmail,
  resendVerification,
} from "../services/authServices";

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(
        "Email is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setIsLoading(true);

      const result = await verifyEmail({
        email,
        otp,
      });

      /*
       * Backend returns:
       * token
       * refreshToken
       * user
       */

      localStorage.setItem(
        "accessToken",
        result.token
      );

      localStorage.setItem(
        "refreshToken",
        result.refreshToken
      );

      /*
       * Store user if needed later.
       */
      localStorage.setItem(
        "authUser",
        JSON.stringify(result.user)
      );

      setSuccessMessage(
        "Email verified successfully."
      );

      /*
       * Give the user a moment to see success,
       * then redirect.
       */
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setErrorMessage(
            "Cannot connect to server. Please ensure the backend is running."
          );
          return;
        }

        if (error.response?.status) {
          setErrorMessage(
            `Request failed with status code ${error.response.status}.`
          );
          return;
        }
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage(
        "Unable to verify your email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(
        "Email is missing. Please register again."
      );
      return;
    }

    try {
      setIsResending(true);

      const result = await resendVerification(email);

      setSuccessMessage(
        result.message ||
          "A new verification code has been sent."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setErrorMessage(
            "Cannot connect to server. Please ensure the backend is running."
          );
          return;
        }
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage(
        "Unable to resend the verification code."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] px-6 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
          {/* HEADER */}
          <div className="text-center mb-8">
            <span className="text-[#6C5CE7] font-bold text-xs tracking-[0.25em] uppercase">
              SPOTNEST
            </span>

            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
              Verify your email
            </h1>

            <p className="text-slate-500 text-sm mt-3">
              Enter the 6-digit verification code sent to
            </p>

            <p className="text-slate-900 font-semibold text-sm mt-1 break-all">
              {email || "your email"}
            </p>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
              {successMessage}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Verification Code
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                  }}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-center text-xl tracking-[0.5em] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* VERIFY */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-[#6C5CE7]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* RESEND */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 mb-2">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold text-[#6C5CE7] hover:text-[#5A4BD1] disabled:opacity-50"
            >
              {isResending
                ? "Sending..."
                : "Resend code"}
            </button>
          </div>

          {/* BACK TO LOGIN */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}