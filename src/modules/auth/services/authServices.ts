import api from "../../../lib/axios";
import type {
  AdminUser,
  AuthUser,
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupPendingResponse,
  VerifyEmailPayload,
  OwnerApprovalRequest,
} from "../types/auth";

export const getOwnerApprovalRequests = async (): Promise<OwnerApprovalRequest[]> => {
  const response = await api.get<{ success: boolean; data: OwnerApprovalRequest[] }>("/auth/admin/verifications");
  return response.data.data;
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get<{ success: boolean; data: AdminUser[] }>("/auth/admin/users");
  return response.data.data;
};

export const approveOwner = async (userId: string): Promise<{ message: string }> => {
  const response = await api.patch<{ success: boolean; data: { message: string } }>(`/auth/admin/verifications/${userId}/approve`);
  return response.data.data;
};

export const rejectOwner = async ({ userId, reason }: { userId: string; reason: string }): Promise<{ message: string }> => {
  const response = await api.patch<{ success: boolean; data: { message: string } }>(`/auth/admin/verifications/${userId}/reject`, { reason });
  return response.data.data;
};

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

export const refresh = async (): Promise<LoginResponse> => {
  /**
   * Browser automatically attaches the HttpOnly refreshToken cookie.
   * No request body is sent.
   */
  const response = await api.post("/auth/refresh");

  return response.data.data;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  /**
   * Browser automatically attaches the HttpOnly accessToken cookie.
   */
  const response = await api.get("/auth/me");

  return response.data.data;
};

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  /**
   * Clears HttpOnly cookies on the backend.
   */
  const response = await api.post("/auth/logout");

  return response.data;
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

export const updateProfile = async (payload: { name?: string; phone?: string }): Promise<AuthUser> => {
  const response = await api.patch<{ success: boolean; data: AuthUser }>("/auth/me", payload);
  return response.data.data;
};

export interface UpdateLocationResponse {
  message: string;
  locationName: string;
  resolvedTo: string;
}

// /auth/me/location returns the raw body — not wrapped in { success, data }.
export const updateLocation = async (locationName: string): Promise<UpdateLocationResponse> => {
  const response = await api.patch<UpdateLocationResponse>("/auth/me/location", { locationName });
  return response.data;
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
  const response = await api.patch<{ success: boolean; data: { message: string } }>("/auth/me/password", payload);
  return response.data.data;
};
