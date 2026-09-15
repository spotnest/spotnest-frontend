"use client";

import { Provider } from "react-redux";
import { useEffect, useState, type ReactNode } from "react";
import { store } from "../store/store";
import { getCurrentUser } from "../modules/auth/services/authServices";
import { signInSucceeded } from "../store/slices/authSlice";

export function ReduxProvider({ children }: { children: ReactNode }) {
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        let isActive = true;

        const initializeAuth = async () => {
            try {
                const user = await getCurrentUser();
                store.dispatch(signInSucceeded(user));
            } catch {
                // A missing or expired cookie means the user is logged out.
            } finally {
                if (isActive) {
                    setIsInitializing(false);
                }
            }
        };

        void initializeAuth();

        return () => {
            isActive = false;
        };
    }, []);

    if (isInitializing) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-[#44474d]">Loading...</div>;
    }

    return <Provider store={store}>{children}</Provider>;
}

