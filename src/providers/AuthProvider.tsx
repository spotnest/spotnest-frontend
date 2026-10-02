"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useCurrentUser } from "@/src/modules/auth/hooks/useCurrentUser";
import { useAppSelector } from "@/src/store/hook";
import { disconnectSocket, getSocket } from "@/src/lib/socket";

interface AuthProviderProps {
    children: ReactNode;
}

function AuthSessionInitializer() {
    const { isAuthenticated, isInitialized } = useCurrentUser();
    const userId = useAppSelector((state) => state.auth.user?.id);

    useEffect(() => {
        if (!isInitialized || !isAuthenticated || !userId) return;
        getSocket().connect();
        return () => disconnectSocket();
    }, [isAuthenticated, isInitialized, userId]);

    return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <>
            <AuthSessionInitializer />
            {children}
        </>
    );
}