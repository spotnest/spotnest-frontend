import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "../type";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  status: "idle",
  error: null,
  pendingEmail: null,
  otpPurpose: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /**
     * Starts an authentication request such as login,
     * logout, session initialization, etc.
     */
    authRequestStarted(state) {
      state.status = "loading";
      state.error = null;
    },

    /**
     * Marks the authentication/session state as initialized.
     *
     * This prevents the application from treating
     * "session has not been checked yet" as "logged out".
     */
    authInitialized(state) {
      state.initialized = true;
      state.status = "idle";
      state.error = null;
    },

    /**
     * Called when login or forgot-password requires OTP verification.
     */
    otpRequired(
      state,
      action: PayloadAction<{
        email: string;
        purpose: "login" | "forgot-password";
      }>
    ) {
      state.status = "idle";
      state.pendingEmail = action.payload.email;
      state.otpPurpose = action.payload.purpose;
      state.error = null;
    },

    /**
     * Stores the authenticated user in Redux.
     *
     * Tokens are NOT stored in Redux.
     * Authentication is handled by HTTP-only cookies.
     */
    signInSucceeded(state, action: PayloadAction<AuthUser>) {
      state.status = "succeeded";
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.pendingEmail = null;
      state.otpPurpose = null;
      state.error = null;
    },

    /**
     * Updates the authenticated user's information.
     */
    userUpdated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    },

    /**
     * Clears the authentication error.
     */
    clearAuthError(state) {
      state.error = null;

      if (state.status === "failed") {
        state.status = "idle";
      }
    },

    /**
     * Handles authentication/session failures.
     */
    authRequestFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },

    /**
     * Marks the user as unauthenticated.
     *
     * The session has still been initialized because we have
     * completed the authentication check.
     */
    signedOut(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.status = "idle";
      state.error = null;
      state.pendingEmail = null;
      state.otpPurpose = null;
    },

    /**
     * Completely resets authentication state.
     *
     * Useful for situations such as a fresh authentication flow.
     */
    resetAuthState(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = false;
      state.status = "idle";
      state.error = null;
      state.pendingEmail = null;
      state.otpPurpose = null;
    },
  },
});

export const {
  authRequestStarted,
  authInitialized,
  otpRequired,
  signInSucceeded,
  userUpdated,
  clearAuthError,
  authRequestFailed,
  signedOut,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
