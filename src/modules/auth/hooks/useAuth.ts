"use client";

import { useAppSelector } from "@/src/store/hook";

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const isInitialized = useAppSelector(
    (state) => state.auth.isInitialized
  );
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  return {
    user,
    isAuthenticated,
    isInitialized,
    status,
    error,
    isLoading: !isInitialized || status === "loading",
  };
}
