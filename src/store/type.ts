export type UserRole =
  | "user"
  | "admin"
  | "owner"
  | "tenant"
  | "customer";


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  isVerified?: boolean;
  isBlock?: boolean;
  status?: string;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  status: AuthStatus;
  error: string | null;
  pendingEmail: string | null;
  otpPurpose: "login" | "forgot-password" | null;
}