export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  OWNER = "owner",
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | "user" | "admin" | "owner";
  image?: string;
  phone?: string;
  isVerified?: boolean;
  isBlock?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "user";
  status: "active" | "inactive" | "suspended";
  isVerified: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  role?: "user" | "owner";
}

export interface SignupPendingResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}