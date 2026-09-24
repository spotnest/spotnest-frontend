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
    const isInitialized = useAppSelector(
        (state) => state.auth.isInitialized
    );

    const initializationStarted = useRef(false);

    useEffect(() => {
        if (initializationStarted.current || isInitialized) {
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
    }, [dispatch, isInitialized]);

    return {
        user,
        isAuthenticated,
        isInitialized,
    };
}
