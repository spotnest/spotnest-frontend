import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AuthState, AuthUser } from "../type";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
    pendingEmail: null,
    otpPurpose: null,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authRequestStarted(state) {
            state.status = 'loading';
            state.error = null;
        },
        /** Called when login/forgot-password returns 200 with requiresOtp — OTP has been sent */
        otpRequired(state, action: PayloadAction<{ email: string; purpose: 'login' | 'forgot-password' }>) {
            state.status = 'idle';
            state.pendingEmail = action.payload.email;
            state.otpPurpose = action.payload.purpose;
            state.error = null;
        },
        signInSucceeded(state, action: PayloadAction<AuthUser>) {
            state.status = 'succeeded';
            state.user = action.payload;
            state.isAuthenticated = true;
            state.pendingEmail = null;
            state.otpPurpose = null;
            state.error = null;
        },
        authRequestFailed(state, action: PayloadAction<string>) {
            state.status = 'failed';
            state.error = action.payload;
        },
        signedOut(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.error = null;
            state.pendingEmail = null;
            state.otpPurpose = null;
        },
    }
});

export const {
    authRequestStarted,
    otpRequired,
    signInSucceeded,
    authRequestFailed,
    signedOut,
} = authSlice.actions;

export default authSlice.reducer;