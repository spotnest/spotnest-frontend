"use client";

import { Provider } from "react-redux";
import { useEffect, useRef, type ReactNode } from "react";
import { AppStore, makeStore, store } from "../store/store";
import { signInSucceeded } from "../store/slices/authSlice";

// export function ReduxProvider({ children }: { children: ReactNode }) {
//     return <Provider store={store}>{children}</Provider>;
// import { useEffect, useRef, type ReactNode } from "react";
// import { Provider } from "react-redux";
// import { makeStore, type AppStore } from "../store/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        if (typeof window !== "undefined" && storeRef.current) {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");
            if (storedUser && token) {
                try {
                    const parsed = JSON.parse(storedUser);
                    storeRef.current.dispatch(signInSucceeded(parsed));
                } catch {
                    // ignore parsing error
                }
            }
        }
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}

