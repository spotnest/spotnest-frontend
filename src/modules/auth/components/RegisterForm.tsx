"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Upload,
  FileText,
} from "lucide-react";

import { useAppSelector } from "@/src/store/hook";
import { signup } from "../services/authServices";
import { getDashboardRouteForRole } from "../utils/roleUtils";

type RoleType = "user" | "owner";

export default function RegisterForm() {
  const router = useRouter();

  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace(getDashboardRouteForRole(user?.role));
  }, [isAuthenticated, user, router]);

  const [role, setRole] = useState<RoleType>("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const resetFileInput = () => {
    setIdDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      allowedExtensions.includes(extension) || allowedTypes.includes(file.type);

    if (!isValidType) {
      setUploadError(
        "Invalid file type. Please upload a PDF, JPG, JPEG, or PNG."
      );
      resetFileInput();
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError(
        "File size exceeds 5MB limit. Please upload a file up to 5MB."
      );
      resetFileInput();
      return;
    }

    setIdDocument(file);
    setUploadError("");
    if (
      errorMessage ===
      "Verification document is required for owner registration"
    ) {
      setErrorMessage("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    resetFileInput();
    setUploadError("");
  };

  const passwordCriteria = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passwordStrengthScore = useMemo(() => {
    if (!password) {
      return 0;
    }

    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria, password]);

  const getStrengthLabel = (score: number) => {
    switch (score) {
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

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

    if (role === "owner" && !idDocument) {
      setErrorMessage("Verification document is required for owner registration");
      setUploadError("Verification document is required for owner registration");
      return;
    }

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

      let payload: unknown;

      if (role === "owner" && idDocument) {
        const formData = new FormData();
        formData.append("name", trimmedName);
        formData.append("email", trimmedEmail);
        formData.append("password", password);
        formData.append("role", role);
        formData.append("idDocument", idDocument);
        payload = formData;
      } else {
        payload = {
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
        };
      }

      const result = await signup(
        payload as unknown as Parameters<typeof signup>[0]
      );

      setSuccessMessage(
        result.message ||
          "Account created. Check your email for a verification code."
      );

      setIsSuccess(true);

      router.push(
        `/otp?email=${encodeURIComponent(trimmedEmail)}`
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

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

        if (typeof data?.message === "string") {
          setErrorMessage(data.message);
          return;
        }

        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setErrorMessage(
            "Cannot connect to server. Please ensure the backend is running on port 5000."
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
        "Unable to create your account. Please try again."
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

          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="flex animate-in flex-col items-center rounded-2xl border border-[#CFCBC3]/60 bg-white p-8 text-center shadow-[0_10px_30px_rgba(28,27,26,0.08)] fade-in zoom-in duration-300 sm:p-10">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#1C1B1A]">
                Account Created!
              </h2>

              <p className="mb-8 max-w-sm text-base leading-relaxed text-[#6F6B65]">
                {successMessage || (
                  <>
                    Welcome to SpotNest! Your account has been registered with{" "}
                    <span className="font-semibold text-[#1C1B1A]">
                      {email}
                    </span>
                    . Please verify your email before logging in.
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
                  className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99]"
                >
                  <span>Verify Email</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/login"
                  className="block py-2 text-center text-base font-semibold text-[#6F6B65] transition-colors hover:text-[#1C1B1A]"
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6F6B65]">
                  Account Type
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#EAE6DF] p-1">
                  {/* USER / RENTER */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("user");
                      setUploadError("");
                      if (
                        errorMessage ===
                        "Verification document is required for owner registration"
                      ) {
                        setErrorMessage("");
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                      role === "user"
                        ? "bg-white font-semibold text-[#1C1B1A] shadow-sm"
                        : "text-[#6F6B65] hover:text-[#1C1B1A]"
                    }`}
                  >
                    <HomeIcon
                      className={`h-4 w-4 ${
                        role === "user"
                          ? "text-[#6C4CE6]"
                          : ""
                      }`}
                    />

                    <span>Renter / Buyer</span>
                  </button>

                  {/* OWNER */}
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                      role === "owner"
                        ? "bg-white font-semibold text-[#1C1B1A] shadow-sm"
                        : "text-[#6F6B65] hover:text-[#1C1B1A]"
                    }`}
                  >
                    <Building2
                      className={`h-4 w-4 ${
                        role === "owner"
                          ? "text-[#6C4CE6]"
                          : ""
                      }`}
                    />

                    <span>Property Owner</span>
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  <X className="h-4 w-4 flex-shrink-0" />

                  <span>{errorMessage}</span>
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* FULL NAME */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <User className="h-5 w-5" />
                    </div>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="John Doe"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-4 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <Mail className="h-5 w-5" />
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-4 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />
                  </div>
                </div>

                {/* OWNER VERIFICATION DOCUMENT */}
                {role === "owner" && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="idDocument"
                        className="block text-sm font-semibold text-[#1C1B1A]"
                      >
                        Verification Document{" "}
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </label>

                      <span className="text-xs font-medium text-[#6C4CE6]">
                        Required for owner registration
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      id="idDocument"
                      name="idDocument"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {!idDocument ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all ${
                          isDragging
                            ? "border-[#6C4CE6] bg-[#EEE9FF]/40"
                            : uploadError
                            ? "border-red-300 bg-red-50/30 hover:border-red-400"
                            : "border-[#CFCBC3] bg-white hover:border-[#6C4CE6] hover:bg-[#FBFBFA]"
                        }`}
                      >
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEE9FF] text-[#6C4CE6] transition-transform duration-200 group-hover:scale-110">
                          <Upload className="h-5 w-5" />
                        </div>

                        <p className="text-sm font-medium text-[#1C1B1A]">
                          <span className="text-[#6C4CE6] underline underline-offset-2">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>

                        <p className="mt-1 text-xs text-[#6F6B65]">
                          Upload PDF, JPG, JPEG or PNG · Maximum 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-[#CFCBC3] bg-white p-3.5 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EEE9FF] text-[#6C4CE6]">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1C1B1A]">
                              {idDocument.name}
                            </p>
                            <p className="text-xs text-[#6F6B65]">
                              {(idDocument.size / (1024 * 1024)).toFixed(2)} MB · Selected
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="ml-2 flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#9A968F] transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label="Remove document"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                        <X className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-[#1C1B1A]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9A968F]">
                      <Lock className="h-5 w-5" />
                    </div>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] transition-colors hover:text-[#1C1B1A] focus:outline-none"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* PASSWORD STRENGTH */}
                  {password && (
                    <div className="mt-2.5 animate-in space-y-2 fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6F6B65]">
                          Password strength:
                        </span>

                        <span
                          className={`font-semibold ${
                            getStrengthLabel(
                              passwordStrengthScore
                            ).text
                          }`}
                        >
                          {
                            getStrengthLabel(
                              passwordStrengthScore
                            ).label
                          }
                        </span>
                      </div>

                      <div className="grid h-1.5 grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-colors duration-300 ${
                              step <= passwordStrengthScore
                                ? getStrengthLabel(
                                    passwordStrengthScore
                                  ).color
                                : "bg-[#EAE6DF]"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div
                          className={`flex items-center gap-1 ${
                            passwordCriteria.length
                              ? "font-medium text-emerald-600"
                              : "text-[#9A968F]"
                          }`}
                        >
                          {passwordCriteria.length ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}

                          <span>8+ characters</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            passwordCriteria.uppercase
                              ? "font-medium text-emerald-600"
                              : "text-[#9A968F]"
                          }`}
                        >
                          {passwordCriteria.uppercase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}

                          <span>1 uppercase letter</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            passwordCriteria.number
                              ? "font-medium text-emerald-600"
                              : "text-[#9A968F]"
                          }`}
                        >
                          {passwordCriteria.number ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}

                          <span>1 number</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            passwordCriteria.special
                              ? "font-medium text-emerald-600"
                              : "text-[#9A968F]"
                          }`}
                        >
                          {passwordCriteria.special ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
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
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm your password"
                      className="h-[54px] w-full rounded-xl border border-[#CFCBC3] bg-white pl-11 pr-11 text-base text-[#1C1B1A] outline-none transition placeholder:text-[#9A968F] hover:border-[#AAA59C] focus:border-[#6C4CE6] focus:ring-4 focus:ring-[#EEE9FF]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9A968F] transition-colors hover:text-[#1C1B1A] focus:outline-none"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex h-[58px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#6C4CE6] px-5 text-lg font-semibold text-white transition hover:bg-[#5738C7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <span
                      className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-label="Creating account"
                    />
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="my-8 flex items-center gap-5">
                <div className="h-px flex-1 bg-[#D8D4CC]" />

                <span className="text-sm font-medium text-[#6F6B65]">
                  OR
                </span>

                <div className="h-px flex-1 bg-[#D8D4CC]" />
              </div>

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
