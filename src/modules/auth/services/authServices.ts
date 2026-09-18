import api from "@/src/lib/axios";

import type {
  AuthMessageResponse,
  AuthResponse,
  CurrentUserResponse,
  ForgotPasswordPayload,
  LoginPayload,
  OtpRequiredResponse,
  ResendVerificationPayload,
  ResetPasswordPayload,
  SignupPayload,
  SignupPendingResponse,
  VerifyEmailPayload,
} from "../types/auth";

/**
 * Sign up a new user.
 *
 * This request does not create an authenticated frontend session.
 * The user normally needs to verify their email first.
 */
export const signup = async (
  payload: SignupPayload
): Promise<SignupPendingResponse> => {
  const response = await api.post<{
    data: SignupPendingResponse;
  }>("/auth/signup", payload);

  return response.data.data;
};

/**
 * Login.
 *
 * Authentication tokens are expected to be handled by the backend
 * through HTTP-only cookies.
 *
 * The frontend receives user information only.
 */
export const login = async (
  payload: LoginPayload
): Promise<AuthResponse | OtpRequiredResponse> => {
  const response = await api.post<{
    data: AuthResponse | OtpRequiredResponse;
  }>("/auth/login", payload);

  return response.data.data;
};

/**
 * Get the currently authenticated user.
 *
 * This is the main endpoint used to restore the frontend session
 * after a page refresh.
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<{
    data: CurrentUserResponse;
  }>("/auth/me");

  return response.data.data;
};

/**
 * Verify email using OTP.
 */
export const verifyEmail = async (
  payload: VerifyEmailPayload
): Promise<AuthResponse | AuthMessageResponse> => {
  const response = await api.post<{
    data: AuthResponse | AuthMessageResponse;
  }>("/auth/verify-email", payload);

  return response.data.data;
};

/**
 * Resend email verification OTP.
 */
export const resendVerification = async (
  payload: ResendVerificationPayload
): Promise<AuthMessageResponse> => {
  const response = await api.post<{
    data: AuthMessageResponse;
  }>("/auth/resend-verification", payload);

  return response.data.data;
};

/**
 * Request a password-reset OTP.
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<AuthMessageResponse> => {
  const response = await api.post<{
    data: AuthMessageResponse;
  }>("/auth/forgot-password", payload);

  return response.data.data;
};

/**
 * Reset the user's password.
 */
export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<AuthMessageResponse> => {
  const response = await api.post<{
    data: AuthMessageResponse;
  }>("/auth/reset-password", payload);

  return response.data.data;
};

/**
 * Refresh the authenticated session.
 *
 * The refresh token is expected to be stored in an HTTP-only cookie
 * by the backend. The frontend does not read or store it.
 */
export const refreshSession = async (): Promise<AuthResponse> => {
  const response = await api.post<{
    data: AuthResponse;
  }>("/auth/refresh");

  return response.data.data;
};

/**
 * Logout the current user.
 *
 * The backend is responsible for clearing authentication cookies.
 */
export const logout = async (): Promise<AuthMessageResponse> => {
  const response = await api.post<{
    data: AuthMessageResponse;
  }>("/auth/logout");

  return response.data.data;
};
