"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { makeStore } from "../store/store";

import {
    signedOut,
} from "../store/slices/authSlice";

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