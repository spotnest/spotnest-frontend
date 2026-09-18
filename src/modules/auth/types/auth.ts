import type { AuthUser, UserRole } from "@/src/store/type";

export type { AuthUser, UserRole };

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SignupPendingResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuthResponse {
  user: AuthUser;
}

export interface CurrentUserResponse {
  user: AuthUser;
}

export interface AuthMessageResponse {
  message: string;
}

export interface OtpRequiredResponse {
  message: string;
  requiresOtp: true;
  email: string;
  purpose: "login" | "forgot-password";
}