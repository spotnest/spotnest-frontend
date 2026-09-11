export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "customer" | "tanant";
    isVerified: boolean;
    isBlock: boolean;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    pendingEmail: string | null;
    otpPurpose: 'login' | 'forgot-password' | null;
}