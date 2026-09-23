"use client";

import { useEffect, useRef } from "react";

import { getCurrentUser } from "../services/authServices";
import {
    authInitialized,
    signInSucceeded,
} from "@/src/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";

export function useCurrentUser() {
    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );
    const initialized = useAppSelector(
        (state) => state.auth.initialized
    );

    const initializationStarted = useRef(false);

    useEffect(() => {
        if (initializationStarted.current || initialized) {
            return;
        }

        initializationStarted.current = true;

        const initializeSession = async () => {
            try {
                const result = await getCurrentUser();

                if (result?.user && (result.user.id || result.user.email)) {
                    dispatch(signInSucceeded(result.user));
                } else {
                    dispatch(authInitialized());
                }
            } catch {
                // No valid session is a normal unauthenticated state.
                dispatch(authInitialized());
            }
        };

        void initializeSession();
    }, [dispatch, initialized]);

    return {
        user,
        isAuthenticated,
        initialized,
    };
}