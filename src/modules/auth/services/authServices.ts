import api from "../../../lib/axios";
import type {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupPendingResponse,
  VerifyEmailPayload,
} from "../types/auth";

export const signup = async (
  payload: SignupPayload
): Promise<SignupPendingResponse> => {
  const response = await api.post("/auth/signup", payload);

  return response.data.data;
};

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", payload);

  return response.data.data;
};

export const verifyEmail = async (
  payload: VerifyEmailPayload
): Promise<LoginResponse> => {
  const response = await api.post("/auth/verify-email", payload);

  return response.data.data;
};

export const resendVerification = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post("/auth/resend-verification", {
    email,
  });

  return response.data.data;
};

export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data.data;
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });

  return response.data.data;
};