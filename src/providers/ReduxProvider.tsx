"use client";

import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { Provider } from "react-redux";

import { makeStore } from "../store/store";

import {
    signInSucceeded,
    signedOut,
} from "../store/slices/authSlice";

import { getCurrentUser } from "../modules/auth/services/authServices";
import { setOnUnauthorizedCallback } from "../lib/axios";

export function ReduxProvider({
    children,
}: {
    children: ReactNode;
}) {
    /**
     * Lazy initializer ensures makeStore() is called exactly once
     * and preserved across re-renders without creating a new store.
     */
    const [store] = useState(() => makeStore());

    useEffect(() => {
        // Register Axios 401 callback to synchronize Redux state
        setOnUnauthorizedCallback(() => {
            store.dispatch(signedOut());
        });

        const restoreAuthentication = async (): Promise<void> => {
            try {
                /**
                 * The browser automatically sends the HttpOnly accessToken cookie.
                 * If the access token is expired, the Axios response interceptor
                 * will attempt a silent refresh via the HttpOnly refreshToken cookie.
                 */
                const user = await getCurrentUser();

                if (user) {
                    store.dispatch(signInSucceeded(user));
                } else {
                    store.dispatch(signedOut());
                }
            } catch {
                /**
                 * Unauthenticated or expired session on startup is normal.
                 * Clear client authentication state cleanly without logging errors.
                 */
                store.dispatch(signedOut());
            }
        };

        void restoreAuthentication();
    }, [store]);

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}