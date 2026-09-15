"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Email is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await verifyEmail({
        email,
        otp,
      });

      /*
       * Store auth data matching LoginForm storage architecture
       */
      localStorage.setItem("accessToken", result.token);
      localStorage.setItem("refreshToken", result.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      setSuccessMessage("Email verified successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.errors?.fieldErrors) {
          const firstFieldErr = Object.values(data.errors.fieldErrors).flat()[0];
          if (typeof firstFieldErr === "string") {
            setErrorMessage(firstFieldErr);
            return;
          }
        }

        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
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

      setErrorMessage("Unable to verify your email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Email is missing. Please register again.");
      return;
    }

    try {
      setIsResending(true);

      const result = await resendVerification(email);

      setSuccessMessage(
        result.message || "A new verification code has been sent to your email."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
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

      setErrorMessage("Unable to resend the verification code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#1C1B1A] md:grid md:grid-cols-2">
      {/* LEFT HERO SECTION (TOWER + BRANDING) */}
      <section className="relative hidden min-h-screen overflow-hidden md:block">
        <div className="absolute inset-0 bg-[url('/images/spotnest-login-tower.png')] bg-cover bg-center" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1A]/90 via-[#1C1B1A]/40 to-[#1C1B1A]/10" />

        <div className="absolute inset-x-10 bottom-14 rounded-2xl border border-white/30 bg-white/70 p-8 shadow-[0_10px_30px_rgba(28,27,26,0.15)] backdrop-blur-xl lg:inset-x-12 lg:bottom-16 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#1C1B1A]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6C4CE6] text-sm text-white">
              S
            </span>
            SpotNest
          </Link>

          <h1 className="mt-8 max-w-lg text-4xl font-bold leading-tight tracking-tight text-[#1C1B1A] lg:text-5xl">
            Find a place. Request it. Make it home.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-9 text-[#6F6B65]">
            Discover rental properties, connect with owners, and find a place
            that feels like home.
          </p>
        </div>
      </section>

      {/* RIGHT FORM SECTION */}
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 md:px-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-[525px]">
          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-xl font-bold tracking-tight md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CE6] text-sm text-white">
              S
            </span>
            SpotNest
          </Link>

          <header className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#6C4CE6]">
              SpotNest
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-[#1C1B1A]">
              Verify your email
            </h2>

            <p className="mt-4 text-lg text-[#6F6B65]">
              Enter the 6-digit verification code sent to{" "}
              <span className="font-semibold text-[#1C1B1A] break-all">
                {email || "your email"}
              </span>
              .
            </p>
          </header>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label
                htmlFor="otp"
                className="mb-3 block text-base font-semibold"
              >
                Verification Code
              </label>

              <div className="relative">
                <input
                  id="otp"
                  name="otp"
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
                  placeholder="000000"
                  className="h-[62px] w-full rounded-xl border border-[#CFCBC3] bg-white px-4 text-center font-mono text-2xl font-bold tracking-[0.4em] sm:tracking-[0.6em] text-[#1C1B1A] outline-none transition placeholder:tracking-normal placeholder:font-sans placeholder:text-lg placeholder:font-normal placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex h-[62px] w-full items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Verify Email
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="my-10 flex items-center gap-5">
            <div className="h-px flex-1 bg-[#D8D4CC]" />
          </div>

          <div className="flex flex-col items-center gap-4 text-center text-base text-[#6F6B65]">
            <p>
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold text-[#6C4CE6] transition hover:text-[#5738C7] disabled:opacity-50 cursor-pointer"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            </p>

            <Link
              href="/login"
              className="font-semibold text-[#1C1B1A] transition hover:text-[#6C4CE6]"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}