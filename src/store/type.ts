export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "user" | "owner" | "admin" | "customer" | "tenant";
    image?: string;
    isVerified?: boolean;
    isBlock?: boolean;
    status?: string;
}

export interface AuthState {
    user: AuthUser | null;

    isAuthenticated: boolean;

    status:
        | "idle"
        | "loading"
        | "succeeded"
        | "failed";

    error: string | null;

    pendingEmail: string | null;

    otpPurpose:
        | "login"
        | "forgot-password"
        | null;

    isInitialized: boolean;
}