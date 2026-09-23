"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import {
  verifyEmail,
  resendVerification,
} from "../services/authServices";
import { signInSucceeded } from "@/src/store/slices/authSlice";
import { useAppDispatch } from "@/src/store/hook";
import { getDashboardRouteForRole } from "../utils/roleUtils";

const OTP_LENGTH = 6;

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = otp.join("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const nextOtp = [...otp];
    nextOtp[index] = digit;

    setOtp(nextOtp);
    setErrorMessage("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextOtp = Array(OTP_LENGTH).fill("");

    pastedValue
      .split("")
      .forEach((digit, index) => {
        nextOtp[index] = digit;
      });

    setOtp(nextOtp);
    setErrorMessage("");

    const nextFocusIndex = Math.min(
      pastedValue.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(
        "Email is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otpValue)) {
      setErrorMessage(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setIsLoading(true);

      const result = await verifyEmail({
        email,
        otp: otpValue,
      });

      if ("user" in result && result.user) {
        if (result.user.role === "owner") {
          const vStatus = result.user.verificationStatus;
          if (vStatus === "pending") {
            setSuccessMessage(
              "Your email has been verified. Your account is pending admin approval."
            );
            setTimeout(() => {
              router.replace(
                `/account-pending?email=${encodeURIComponent(email)}`
              );
            }, 800);
            return;
          }

          setSuccessMessage(
            "Email verified successfully. Please complete owner verification."
          );
          setTimeout(() => {
            router.push("/owner/verification");
          }, 800);
          return;
        }

        dispatch(signInSucceeded(result.user));

        setSuccessMessage(
          "Email verified successfully! Redirecting..."
        );

        setTimeout(() => {
          const targetRoute = getDashboardRouteForRole(
            result.user.role
          );
          router.push(targetRoute);
        }, 800);

        return;
      }

      setSuccessMessage(
        "Email verified successfully! Please sign in."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.errors?.fieldErrors) {
          const firstFieldError = Object.values(
            data.errors.fieldErrors
          ).flat()[0];

          if (typeof firstFieldError === "string") {
            setErrorMessage(firstFieldError);
            return;
          }
        }

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

      const result = await resendVerification({
        email,
      });

      setSuccessMessage(
        result.message ||
          "A new verification code has been sent to your email."
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
    <main className="min-h-screen bg-[#F7F5F0] text-[#1C1B1A] md:grid md:grid-cols-2">
      {/* LEFT HERO SECTION */}
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
            Discover rental properties, connect with owners,
            and find a place that feels like home.
          </p>
        </div>
      </section>

      {/* RIGHT FORM SECTION */}
      <section className="flex min-h-screen items-center justify-center overflow-y-auto px-5 py-12 sm:px-10 md:px-12 lg:px-20">
        <div className="w-full max-w-[525px]">
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
              <span className="break-all font-semibold text-[#1C1B1A]">
                {email || "your email"}
              </span>
              .
            </p>
          </header>

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600"
            >
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            <div>
              <label
                htmlFor="otp-0"
                className="mb-4 block text-base font-semibold"
              >
                Verification Code
              </label>

              <div
                className="flex justify-between gap-2 sm:gap-3"
                role="group"
                aria-label="Verification code"
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    id={`otp-${index}`}
                    name={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(
                        index,
                        event.target.value
                      )
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(index, event)
                    }
                    onPaste={handlePaste}
                    aria-label={`Verification digit ${
                      index + 1
                    }`}
                    className="h-[62px] w-full max-w-[68px] rounded-xl border border-[#CFCBC3] bg-white text-center font-mono text-2xl font-bold text-[#1C1B1A] outline-none transition hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF] sm:h-[68px] sm:max-w-[72px] sm:text-3xl"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || otpValue.length !== OTP_LENGTH
              }
              className="flex h-[62px] w-full items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span
                  className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-label="Verifying"
                />
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

            <span className="text-sm font-medium text-[#6F6B65]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#D8D4CC]" />
          </div>

          <div className="flex flex-col items-center gap-4 text-center text-base text-[#6F6B65]">
            <p>
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="cursor-pointer font-semibold text-[#6C4CE6] transition hover:text-[#5738C7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending
                  ? "Sending..."
                  : "Resend code"}
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
