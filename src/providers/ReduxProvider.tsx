"use client";

import { useEffect, useState, type ReactNode } from "react";
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
     * Create the Redux store once for the lifetime of this provider.
     */
    const [store] = useState(() => makeStore());

    useEffect(() => {
        /**
         * Synchronize Axios authentication failures with Redux.
         *
         * When refresh fails, axios calls this callback and the
         * client authentication state is cleared.
         */
        setOnUnauthorizedCallback(() => {
            store.dispatch(signedOut());
        });

        const restoreAuthentication = async (): Promise<void> => {
            try {
                /**
                 * Authentication uses HttpOnly cookies.
                 *
                 * getCurrentUser() sends the cookies automatically.
                 * If the access token is expired, axios will attempt
                 * to refresh the session using the refresh cookie.
                 */
                const response = await getCurrentUser();

                const user = response?.user;

                if (user) {
                    store.dispatch(signInSucceeded(user));
                } else {
                    store.dispatch(signedOut());
                }
            } catch {
                /**
                 * No active session is a normal state on initial load.
                 */
                store.dispatch(signedOut());
            }
        };

        void restoreAuthentication();

        /**
         * No cleanup is required here because the Axios callback
         * remains registered for the lifetime of the application.
         */
    }, [store]);

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}