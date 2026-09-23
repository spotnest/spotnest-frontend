"use client";

import { useAppSelector } from "@/src/store/hook";

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const initialized = useAppSelector(
    (state) => state.auth.initialized
  );
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  return {
    user,
    isAuthenticated,
    initialized,
    status,
    error,
    isLoading: !initialized || status === "loading",
  };
}
