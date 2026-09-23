import type { AuthUser, UserRole } from "@/src/store/type";

export type { AuthUser, UserRole };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "user";
  status: "active" | "inactive" | "suspended";
  isVerified: boolean;
  createdAt: string;
}

export interface OwnerApprovalRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  isVerified: boolean;
  verificationStatus?:
    | "unsubmitted"
    | "pending"
    | "approved"
    | "rejected";
  createdAt: string;
  submittedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  role?: "user" | "owner";
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

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
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

export interface OwnerEmailVerifiedResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    verificationStatus:
      | "unsubmitted"
      | "pending"
      | "approved"
      | "rejected";
  };
}