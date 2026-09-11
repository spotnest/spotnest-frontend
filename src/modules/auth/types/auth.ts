export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  OWNER = "owner",
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
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