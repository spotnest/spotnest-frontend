"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Check,
  X,
  ShieldCheck,
  Building2,
  Home as HomeIcon,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { signup } from "../services/authServices";

type RoleType = "renter" | "agent";

export default function RegisterForm() {
  const router = useRouter();

  const [role, setRole] = useState<RoleType>("renter");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordStrengthScore = useMemo(() => {
    if (!password) return 0;

    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria, password]);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return {
          label: "",
          color: "bg-slate-200",
          text: "text-slate-400",
        };

      case 1:
        return {
          label: "Weak",
          color: "bg-red-500",
          text: "text-red-500",
        };

      case 2:
        return {
          label: "Fair",
          color: "bg-amber-500",
          text: "text-amber-500",
        };

      case 3:
        return {
          label: "Good",
          color: "bg-blue-500",
          text: "text-blue-500",
        };

      case 4:
        return {
          label: "Strong",
          color: "bg-emerald-500",
          text: "text-emerald-500",
        };

      default:
        return {
          label: "",
          color: "bg-slate-200",
          text: "text-slate-400",
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    /*
     * Backend requires a minimum of 6 characters.
     * We keep your existing UI password-strength behavior,
     * but allow any password that satisfies the backend requirement.
     */
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      /*
       * Your backend signup schema accepts:
       * name
       * email
       * password
       * phone (optional)
       * image (optional)
       *
       * Role is currently only a frontend UI selection.
       * We do NOT send it because your backend signup schema
       * does not accept a role field.
       */
      const result = await signup({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      setSuccessMessage(
        result.message ||
          "Account created. Check your email for a verification code."
      );

      setIsSuccess(true);

      /*
       * IMPORTANT:
       *
       * Backend has already created the user and sent the OTP.
       *
       * Send the user directly to the OTP page.
       *
       * The email is passed through the URL so the OTP page
       * knows which account needs verification.
       */
      router.push(`/otp?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        /*
         * Zod validation errors
         */
        if (data?.errors?.fieldErrors) {
          const fieldErrors = data.errors.fieldErrors;

          const firstError = Object.values(fieldErrors)
            .flat()
            .find((value) => typeof value === "string");

          if (typeof firstError === "string") {
            setErrorMessage(firstError);
            return;
          }
        }

        /*
         * Normal backend AppError message
         */
        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        /*
         * Backend not reachable
         */
        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setErrorMessage(
            "Cannot connect to server. Please ensure the backend is running on port 5000."
          );
          return;
        }

        /*
         * HTTP status fallback
         */
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

      setErrorMessage("Unable to create your account. Please try again.");
    } finally {
      setIsLoading(false);
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
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 md:px-12 lg:px-20 overflow-y-auto">
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

          {isSuccess ? (
            <div className="rounded-2xl border border-[#CFCBC3]/60 bg-white p-8 sm:p-10 shadow-[0_10px_30px_rgba(28,27,26,0.08)] text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-[#1C1B1A] mb-2">
                Account Created!
              </h2>

              <p className="text-[#6F6B65] text-base max-w-sm mb-8 leading-relaxed">
                {successMessage || (
                  <>
                    Welcome to SpotNest! Your account has been registered with{" "}
                    <span className="font-semibold text-[#1C1B1A]">{email}</span>. Please verify your email before logging in.
                  </>
                )}
              </p>

              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/otp?email=${encodeURIComponent(email.trim())}`
                    )
                  }
                  className="flex h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] cursor-pointer"
                >
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/login"
                  className="block text-center text-base font-semibold text-[#6F6B65] hover:text-[#1C1B1A] py-2 transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* HEADER */}
              <header className="mb-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6C4CE6]">
                  SpotNest
                </p>

                <h2 className="text-4xl font-bold tracking-tight text-[#1C1B1A]">
                  Create an account
                </h2>

                <p className="mt-3 text-lg text-[#6F6B65]">
                  Please enter your details to create your account.
                </p>
              </header>

              {/* ACCOUNT TYPE */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F6B65] mb-2">
                  Account Type
                </label>

                <div className="grid grid-cols-2 gap-2 p-1 bg-[#EAE6DF] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      role === "renter"
                        ? "bg-white text-[#1C1B1A] shadow-sm font-semibold"
                        : "text-[#6F6B65] hover:text-[#1C1B1A]"
                    }`}
                  >
                    <HomeIcon
                      className={`w-4 h-4 ${
                        role === "renter" ? "text-[#6C4CE6]" : ""
                      }`}
                    />

                    <span>Renter / Buyer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      role === "agent"
                        ? "bg-white text-[#1C1B1A] shadow-sm font-semibold"
                        : "text-[#6F6B65] hover:text-[#1C1B1A]"
                    }`}
                  >
                    <Building2
                      className={`w-4 h-4 ${
                        role === "agent" ? "text-[#6C4CE6]" : ""
                      }`}
                    />

                    <span>Property Agent</span>
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2.5">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]">
                    Full Name
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <User className="w-5 h-5" />
                    </div>

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-4 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]">
                    Email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <Mail className="w-5 h-5" />
                    </div>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-4 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]">
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <Lock className="w-5 h-5" />
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] hover:text-[#1C1B1A] focus:outline-none transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* PASSWORD STRENGTH */}
                  {password && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6F6B65]">
                          Password strength:
                        </span>

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
                            passwordCriteria.length
                              ? "text-emerald-600 font-medium"
                              : "text-[#9A968F]"
                          }`}
                        >
                          {passwordCriteria.length ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}

                          <span>8+ characters</span>
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
                  <label className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your password"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] hover:text-[#1C1B1A] focus:outline-none transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR */}
              <div className="my-8 flex items-center gap-5">
                <div className="h-px flex-1 bg-[#D8D4CC]" />
                <span className="text-sm font-medium text-[#6F6B65]">OR</span>
                <div className="h-px flex-1 bg-[#D8D4CC]" />
              </div>

              {/* GOOGLE
              <button
                type="button"
                className="flex h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-[#CFCBC3] bg-white px-5 text-lg font-semibold text-[#1C1B1A] transition hover:bg-[#EEE9FF]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                Continue with Google
              </button> */}

              {/* LOGIN */}
              <p className="mt-8 text-center text-lg text-[#6F6B65]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#1C1B1A] transition hover:text-[#6C4CE6]"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}