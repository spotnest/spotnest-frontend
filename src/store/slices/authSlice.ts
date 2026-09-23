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
    authRequestStarted(state) {
      state.status = "loading";
      state.error = null;
    },

    authInitialized(state) {
      state.initialized = true;

      if (state.status === "loading") {
        state.status = "idle";
      }

      state.error = null;
    },

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

    signInSucceeded(
      state,
      action: PayloadAction<AuthUser>
    ) {
      state.status = "succeeded";
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.pendingEmail = null;
      state.otpPurpose = null;
      state.error = null;
    },

    userUpdated(
      state,
      action: PayloadAction<AuthUser>
    ) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    },

    clearAuthError(state) {
      state.error = null;

      if (state.status === "failed") {
        state.status = "idle";
      }
    },

    authRequestFailed(
      state,
      action: PayloadAction<string>
    ) {
      state.status = "failed";
      state.error = action.payload;
      state.initialized = true;
    },

    signedOut(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.status = "idle";
      state.error = null;
      state.pendingEmail = null;
      state.otpPurpose = null;
    },

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