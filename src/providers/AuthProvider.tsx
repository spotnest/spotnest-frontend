"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useCurrentUser } from "@/src/modules/auth/hooks/useCurrentUser";
import { useAppSelector } from "@/src/store/hook";
import { connectSocket, disconnectSocket } from "@/src/lib/socket";
import { RealtimeSync } from "./RealtimeSync";

interface AuthProviderProps {
    children: ReactNode;
}

function AuthSessionInitializer() {
    const { isAuthenticated, isInitialized } = useCurrentUser();
    const userId = useAppSelector((state) => state.auth.user?.id);

    // Exactly one socket connection per authenticated session. It survives
    // client-side navigation and is closed on sign-out or user switch.
    useEffect(() => {
        if (!isInitialized || !isAuthenticated || !userId) return;
        connectSocket();
        return () => disconnectSocket();
    }, [isAuthenticated, isInitialized, userId]);

    return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <>
            <AuthSessionInitializer />
            <RealtimeSync />
            {children}
        </>
    );
}
