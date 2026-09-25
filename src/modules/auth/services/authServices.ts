import api from "@/src/lib/axios";

import type {
  AdminUser,
  AuthMessageResponse,
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  CurrentUserResponse,
  ForgotPasswordPayload,
  LoginPayload,
  OtpRequiredResponse,
  OwnerApprovalRequest,
  OwnerEmailVerifiedResponse,
  ResendVerificationPayload,
  ResetPasswordPayload,
  SignupPayload,
  SignupPendingResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  VerifyEmailPayload,
} from "../types/auth";

/**
 * Sign up a new user.
 *
 * This request does not create an authenticated frontend session.
 * The user normally needs to verify their email first.
 */
export const signup = async (
  payload: SignupPayload | FormData
): Promise<SignupPendingResponse> => {
  const response = await api.post<{
    data: SignupPendingResponse;
  }>("/auth/signup", payload);

  return response.data.data;
};

/**
 * Login.
 *
 * Authentication tokens are handled by the backend
 * through HTTP-only cookies.
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
 * Backend:
 * GET /auth/me
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<{
    success?: boolean;
    data: AuthUser | { user: AuthUser };
  }>("/auth/me");

  const rawData = response.data.data;

  const user =
    rawData &&
      typeof rawData === "object" &&
      "user" in rawData &&
      rawData.user
      ? rawData.user
      : (rawData as AuthUser);

  return { user };
};

/**
 * Verify email using OTP.
 *
 * Normal users receive authentication data.
 * Owners receive verification information but are NOT
 * automatically authenticated until admin approval.
 */
export const verifyEmail = async (
  payload: VerifyEmailPayload
): Promise<AuthResponse | OwnerEmailVerifiedResponse> => {
  const response = await api.post<{
    data: AuthResponse | OwnerEmailVerifiedResponse;
  }>("/auth/verify-email", payload);

  return response.data.data;
};

// Get pending owner verification requests.
export const getOwnerApprovalRequests = async (): Promise<
  OwnerApprovalRequest[]
> => {
  const response = await api.get<{
    success: boolean;
    data: OwnerApprovalRequest[];
  }>("/auth/admin/verifications");

  return response.data.data;
};

//  Get all users.

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get<{
    success: boolean;
    data: AdminUser[];
  }>("/auth/admin/users");

  return response.data.data;
};


// Approve an owner's verification.

export const approveOwner = async (
  userId: string
): Promise<{ message: string }> => {
  const response = await api.patch<{
    success: boolean;
    data: { message: string };
  }>(`/auth/admin/verifications/${userId}/approve`);

  return response.data.data;
};

/**
 * Reject an owner's verification.
 *
 * Admin only.
 */
export const rejectOwner = async ({
  userId,
  reason,
}: {
  userId: string;
  reason: string;
}): Promise<{ message: string }> => {
  const response = await api.patch<{
    success: boolean;
    data: { message: string };
  }>(`/auth/admin/verifications/${userId}/reject`, { reason });

  return response.data.data;
};

/**
 * Upload owner certification / ID document.
 *
 * Owner only.
 *
 * Backend:
 * POST /auth/owner/verification
 */
export const uploadOwnerVerification = async (
  file: File
): Promise<{ message: string }> => {
  const formData = new FormData();

  formData.append("idDocument", file);

  const response = await api.post<{
    success: boolean;
    data: { message: string };
  }>("/auth/owner/verification", formData);

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
 * Refresh token is handled through an HTTP-only cookie.
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
 * Backend clears authentication cookies.
 */
export const logout = async (): Promise<AuthMessageResponse> => {
  const response = await api.post<{
    data?: AuthMessageResponse;
    message?: string;
  }>("/auth/logout");

  const message =
    response.data.message ||
    response.data.data?.message ||
    "Logged out successfully";

  return { message };
};

/**
 * Update the current user's profile.
 *
 * Backend:
 * PATCH /auth/me
 */
export const updateProfile = async (
  data: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  const response = await api.patch<{
    success?: boolean;
    data: UpdateProfileResponse;
  }>("/auth/me", data);

  return response.data.data;
};

/**
 * Update the user's location used for nearby-property discovery.
 *
 * Backend:
 * PATCH /auth/me/location
 *
 * The backend returns the raw response rather than
 * wrapping it inside { success, data }.
 */
export interface UpdateLocationResponse {
  message: string;
  locationName: string;
  resolvedTo: string;
}

export const updateLocation = async (
  locationName: string
): Promise<UpdateLocationResponse> => {
  const response = await api.patch<UpdateLocationResponse>(
    "/auth/me/location",
    { locationName }
  );

  return response.data;
};

/**
 * Change the current user's password.
 *
 * Backend:
 * PATCH /auth/me/password
 *
 * confirmPassword is used only for frontend validation
 * and is intentionally not sent to the backend.
 */
export const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  const response = await api.patch<{
    success?: boolean;
    data: ChangePasswordResponse;
  }>("/auth/me/password", {
    currentPassword,
    newPassword,
  });

  return response.data.data;
};
