"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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

type RoleType = "renter" | "agent";

export default function RegisterPage() {
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

  // Password requirements calculation
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
        return { label: "", color: "bg-slate-200" };
      case 1:
        return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { label: "Good", color: "bg-blue-500", text: "text-blue-500" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { label: "", color: "bg-slate-200" };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (passwordStrengthScore < 2) {
      setErrorMessage("Please choose a stronger password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Simulate API registration delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF8F5] text-slate-900 selection:bg-[#6C5CE7] selection:text-white font-sans">
      {/* Left 50% Hero Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative p-6 bg-slate-950 flex-col justify-end overflow-hidden">
        {/* Architectural Skyscraper Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />

        {/* Gradient Overlay for Mood & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Floating SpotNest Glass Card at Bottom-Left */}
        <div className="relative z-10 bg-[#FAF8F5]/90 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/50 shadow-2xl max-w-lg mb-4">
          {/* Logo Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#6C5CE7]/30">
              S
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Spot<span className="text-[#6C5CE7]">Nest</span>
            </span>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Find a place. Request it. Make it home.
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 text-base leading-relaxed">
            Discover rental properties, connect with owners, and find a place that feels like home.
          </p>
        </div>
      </div>

      {/* Right 50% Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {isSuccess ? (
            /* Success State Card */
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Account Created! 🎉
              </h2>

              <p className="text-slate-600 text-sm max-w-xs mb-8 leading-relaxed">
                Welcome to SpotNest! Your <span className="font-semibold text-slate-900 capitalize">{role}</span> account has been registered with <span className="font-semibold text-slate-900">{email}</span>.
              </p>

              <div className="w-full space-y-3">
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-[#6C5CE7]/25 transition-all"
                >
                  <span>Explore Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full block text-center text-sm font-medium text-slate-600 hover:text-slate-900 py-2 transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <div>
              {/* Header */}
              <div className="mb-6">
                <span className="text-[#6C5CE7] font-bold text-xs tracking-[0.25em] uppercase block mb-1">
                  SPOTNEST
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Create an account
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Please enter your details to create your account.
                </p>
              </div>

              {/* Account Type Selector (Renter vs Landlord/Agent) */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      role === "renter"
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <HomeIcon className={`w-4 h-4 ${role === "renter" ? "text-[#6C5CE7]" : ""}`} />
                    <span>Renter / Buyer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      role === "agent"
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${role === "agent" ? "text-[#6C5CE7]" : ""}`} />
                    <span>Property Agent</span>
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-center gap-2.5">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Password strength:</span>
                        <span className={`font-semibold ${getStrengthLabel(passwordStrengthScore).text}`}>
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
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div className={`flex items-center gap-1 ${passwordCriteria.length ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>1 uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.number ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>1 number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.special ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                          {passwordCriteria.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>1 special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-[#6C5CE7] hover:bg-[#5A4BD1] active:bg-[#4D3EB9] text-white font-semibold rounded-xl shadow-lg shadow-[#6C5CE7]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#FAF8F5] px-3 text-slate-400 font-semibold tracking-wider">
                    OR
                  </span>
                </div>
              </div>

              {/* Social Login: Continue with Google */}
              <button
                type="button"
                onClick={() => alert("Google Auth integration spot")}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-colors"
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
                <span>Continue with Google</span>
              </button>

              {/* Already have an account? Log in */}
              <p className="text-center text-sm text-slate-600 mt-8">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#6C5CE7] hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
