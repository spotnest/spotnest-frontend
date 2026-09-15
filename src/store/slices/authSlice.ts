import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import type {
    AuthState,
    AuthUser,
} from "../type";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    status: "loading",
    error: null,
    pendingEmail: null,
    otpPurpose: null,
    isInitialized: false,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        authRequestStarted(state) {
            state.status = "loading";
            state.error = null;
        },

        otpRequired(
            state,
            action: PayloadAction<{
                email: string;
                purpose:
                    | "login"
                    | "forgot-password";
            }>
        ) {
            state.status = "idle";

            state.pendingEmail =
                action.payload.email;

            state.otpPurpose =
                action.payload.purpose;

            state.error = null;
        },

        signInSucceeded(
            state,
            action: PayloadAction<AuthUser>
        ) {
            state.status = "succeeded";

            state.user = action.payload;

            state.isAuthenticated = true;

            state.isInitialized = true;

            state.pendingEmail = null;

            state.otpPurpose = null;

            state.error = null;
        },

        authRequestFailed(
            state,
            action: PayloadAction<string>
        ) {
            state.status = "failed";

            state.error = action.payload;

            state.isInitialized = true;
        },

        signedOut(state) {
            state.user = null;

            state.isAuthenticated = false;

            state.status = "idle";

            state.isInitialized = true;

            state.error = null;

            state.pendingEmail = null;

            state.otpPurpose = null;
        },

        authInitialized(state) {
            state.isInitialized = true;

            if (state.status === "loading") {
                state.status = "idle";
            }
        },
    },
});

export const {
    authRequestStarted,
    otpRequired,
    signInSucceeded,
    authRequestFailed,
    signedOut,
    authInitialized,
} = authSlice.actions;

export default authSlice.reducer;