"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { signInSucceeded } from "@/src/store/slices/authSlice";
import { login } from "../services/authServices";

const EmailIcon = () => (
  <svg
    aria-hidden="true"
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const LockIcon = () => (
  <svg
    aria-hidden="true"
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    className="h-6 w-6"
    viewBox="0 0 24 24"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      fill="#4285F4"
    />

    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      fill="#34A853"
    />

    <path
      d="M5.84 14.09A6.96 6.96 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
      fill="#FBBC05"
    />

    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.94 10.94 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "owner") {
        router.replace("/owner/dashboard");
      } else if (user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/user/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api/v1";

    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      /*
       * Update Redux immediately after successful login.
       * Tokens are stored automatically by the browser as HttpOnly cookies.
       */
      dispatch(signInSucceeded(response.user));

      /*
       * Redirect based on authenticated user's role.
       */
      if (response.user.role === "owner") {
        router.push("/owner/dashboard");
      } else if (response.user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        /*
         * Validation errors from backend.
         */
        if (data?.errors?.fieldErrors) {
          const firstFieldError = Object.values(
            data.errors.fieldErrors
          ).flat()[0];

          if (typeof firstFieldError === "string") {
            setErrorMessage(firstFieldError);
            return;
          }
        }

        /*
         * Normal backend error.
         */
        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        /*
         * Backend unavailable.
         */
        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setErrorMessage(
            "Cannot connect to server. Please ensure the backend is running."
          );
          return;
        }

        /*
         * HTTP status fallback.
         */
        if (error.response?.status) {
          setErrorMessage(
            `Login failed with status code ${error.response.status}.`
          );
          return;
        }
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage(
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#1C1B1A] md:grid md:grid-cols-2">

      {/* =====================================================
          LEFT HERO SECTION
          ===================================================== */}
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

      {/* =====================================================
          RIGHT LOGIN SECTION
          ===================================================== */}
      <section className="flex min-h-screen items-center justify-center overflow-y-auto px-5 py-12 sm:px-10 md:px-12 lg:px-20">

        <div className="w-full max-w-[525px]">

          {/* Mobile logo */}
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-xl font-bold tracking-tight md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CE6] text-sm text-white">
              S
            </span>

            SpotNest
          </Link>

          {/* Header */}
          <header className="mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#6C4CE6]">
              SpotNest
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-[#1C1B1A]">
              Welcome back
            </h2>

            <p className="mt-4 text-lg text-[#6F6B65]">
              Please enter your details to access your account.
            </p>
          </header>

          {/* Error message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-base font-semibold"
              >
                Email
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A968F]">
                  <EmailIcon />
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="you@example.com"
                  className="h-[62px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-14 pr-4 text-lg outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-3 block text-base font-semibold"
              >
                Password
              </label>

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A968F]">
                  <LockIcon />
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Enter your password"
                  className="h-[62px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-14 pr-12 text-lg outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#9A968F] transition-colors hover:text-[#1C1B1A] focus:outline-none"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-base font-semibold transition hover:text-[#6C4CE6]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[62px] w-full items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span
                  className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <>
                  Sign In

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

          {/* Divider */}
          <div className="my-10 flex items-center gap-5">
            <div className="h-px flex-1 bg-[#D8D4CC]" />

            <span className="text-sm font-medium text-[#6F6B65]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#D8D4CC]" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-[#CFCBC3] bg-white px-5 text-lg font-semibold transition hover:bg-[#EEE9FF]"
          >
            <GoogleIcon />

            Continue with Google
          </button>

          {/* Register */}
          <p className="mt-12 text-center text-lg text-[#6F6B65]">
            Don&apos;t have an account?{" "}

            <Link
              href="/register"
              className="font-semibold text-[#1C1B1A] transition hover:text-[#6C4CE6]"
            >
              Create an account
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}