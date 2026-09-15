"use client";

import { FormEvent, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { resetPassword, forgotPassword } from "../services/authServices";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState<{
    email?: boolean;
    otp?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password criteria computation consistent with RegisterForm
  const passwordCriteria = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      minBackend: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const passwordStrengthScore = useMemo(() => {
    if (!newPassword) return 0;
    const criteriaList = [
      passwordCriteria.length,
      passwordCriteria.uppercase,
      passwordCriteria.number,
      passwordCriteria.special,
    ];
    return criteriaList.filter(Boolean).length;
  }, [passwordCriteria, newPassword]);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return { label: "", color: "bg-[#EAE6DF]", text: "text-[#9A968F]" };
      case 1:
        return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { label: "Good", color: "bg-blue-500", text: "text-blue-500" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { label: "", color: "bg-[#EAE6DF]", text: "text-[#9A968F]" };
    }
  };

  // Inline validation checks
  const isPasswordsMatching =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordsMismatched =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isOtpIncomplete =
    touched.otp && otp.length > 0 && otp.length < 6;
  const isEmailInvalid =
    touched.email && email.trim().length > 0 && !email.includes("@");

  const handleBlur = (field: "email" | "otp" | "newPassword" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setErrorMessage("Verification code must be exactly 6 digits.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword.length > 255) {
      setErrorMessage("Password must not exceed 255 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(
        trimmedEmail,
        trimmedOtp,
        newPassword
      );

      setSuccessMessage(
        response.message || "Password updated. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.errors?.fieldErrors) {
          const firstFieldErr = Object.values(data.errors.fieldErrors)
            .flat()
            .find((val) => typeof val === "string");

          if (typeof firstFieldErr === "string") {
            setErrorMessage(firstFieldErr);
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
      } else {
        setErrorMessage("Unable to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address to receive a code.");
      return;
    }

    setIsResending(true);

    try {
      const response = await forgotPassword(trimmedEmail);

      setSuccessMessage(
        response.message || "A new verification code has been sent to your email."
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

      setErrorMessage("Unable to resend the code. Please try again.");
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
      <section className="flex min-h-screen items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 md:px-12 lg:px-20">
        <div className="w-full max-w-[525px]">
          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xl font-bold tracking-tight md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CE6] text-sm text-white">
              S
            </span>
            SpotNest
          </Link>

          {/* HEADER */}
          <header className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6C4CE6]">
              SpotNest
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-[#1C1B1A]">
              Reset your password
            </h1>

            <p className="mt-3 text-lg text-[#6F6B65]">
              Enter the verification code sent to your email and create a new password.
            </p>
          </header>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600 flex items-center gap-2.5">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS ALERT */}
          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
              >
                Email Address
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                  <Mail className="w-5 h-5" />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onBlur={() => handleBlur("email")}
                  placeholder="you@example.com"
                  className={`h-[54px] w-full rounded-xl border bg-white pl-11 pr-4 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] focus:ring-4 ${
                    isEmailInvalid
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-[#CFCBC3] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-[#EEE9FF]"
                  }`}
                />
              </div>

              {isEmailInvalid && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* OTP CODE */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <label
                  htmlFor="otp"
                  className="block text-sm font-semibold text-[#1C1B1A]"
                >
                  Verification Code
                </label>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-xs font-semibold text-[#6C4CE6] transition hover:text-[#5738C7] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <div className="relative">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setOtp(value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onBlur={() => handleBlur("otp")}
                  placeholder="Enter 6-digit code"
                  className={`h-[54px] w-full rounded-xl border bg-white px-4 text-center font-mono text-xl font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#1C1B1A] outline-none transition placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-[#9A968F] focus:ring-4 ${
                    isOtpIncomplete
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-[#CFCBC3] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-[#EEE9FF]"
                  }`}
                />
              </div>

              {isOtpIncomplete && (
                <p className="mt-1 text-xs text-red-500">
                  Verification code must be exactly 6 digits.
                </p>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
              >
                New Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                  <Lock className="w-5 h-5" />
                </div>

                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onBlur={() => handleBlur("newPassword")}
                  placeholder="Enter new password"
                  className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] hover:text-[#1C1B1A] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* PASSWORD STRENGTH & CRITERIA (Matching RegisterForm) */}
              {newPassword && (
                <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6F6B65]">Password strength:</span>
                    <span
                      className={`font-semibold ${
                        getStrengthLabel(passwordStrengthScore).text
                      }`}
                    >
                      {getStrengthLabel(passwordStrengthScore).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-colors duration-300 ${
                          step <= passwordStrengthScore
                            ? getStrengthLabel(passwordStrengthScore).color
                            : "bg-[#EAE6DF]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div
                      className={`flex items-center gap-1 ${
                        passwordCriteria.minBackend
                          ? "text-emerald-600 font-medium"
                          : "text-[#9A968F]"
                      }`}
                    >
                      {passwordCriteria.minBackend ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>6+ characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordCriteria.uppercase
                          ? "text-emerald-600 font-medium"
                          : "text-[#9A968F]"
                      }`}
                    >
                      {passwordCriteria.uppercase ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>1 uppercase letter</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordCriteria.number
                          ? "text-emerald-600 font-medium"
                          : "text-[#9A968F]"
                      }`}
                    >
                      {passwordCriteria.number ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>1 number</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        passwordCriteria.special
                          ? "text-emerald-600 font-medium"
                          : "text-[#9A968F]"
                      }`}
                    >
                      {passwordCriteria.special ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>1 special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="Confirm new password"
                  className={`h-[54px] w-full rounded-xl border bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] focus:ring-4 ${
                    isPasswordsMismatched && touched.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : isPasswordsMatching
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                      : "border-[#CFCBC3] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-[#EEE9FF]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] hover:text-[#1C1B1A] focus:outline-none transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* INLINE PASSWORD MATCH FEEDBACK */}
              {isPasswordsMismatched && touched.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <X className="w-3 h-3" />
                  Passwords do not match.
                </p>
              )}

              {isPasswordsMatching && (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="w-3 h-3" />
                  Passwords match.
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition-all duration-200 hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer shadow-lg shadow-[#6C4CE6]/20"
            >
              {isLoading ? (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* BACK TO LOGIN */}
          <p className="mt-8 text-center text-lg text-[#6F6B65]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1C1B1A] transition hover:text-[#6C4CE6]"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}