"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "../store/store";
import { signInSucceeded } from "../store/slices/authSlice";

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
