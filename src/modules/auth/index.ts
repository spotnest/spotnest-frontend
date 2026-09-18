// Auth components
export { default as LoginForm } from "./components/LoginForm";
export { default as RegisterForm } from "./components/RegisterForm";
export { default as ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { default as OtpVerificationForm } from "./components/OtpVerificationForm";
export { default as ResetPasswordForm } from "./components/ResetPasswordForm";

// Auth hooks
export { useAuth } from "./hooks/useAuth";
export { useCurrentUser } from "./hooks/useCurrentUser";
export { useLogin } from "./hooks/useLogin";
export { useLogout } from "./hooks/useLogout";
export { useSignup } from "./hooks/useSIgnup";
// Auth services
export {
  signup,
  login,
  getCurrentUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshSession,
  logout,
} from "./services/authServices";

// Auth types
export type {
  AuthUser,
  UserRole,
  LoginPayload,
  SignupPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignupPendingResponse,
  AuthResponse,
  CurrentUserResponse,
  AuthMessageResponse,
  OtpRequiredResponse,
} from "./types/auth";