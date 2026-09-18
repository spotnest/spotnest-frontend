"use client";

import type { ReactNode } from "react";

import { useCurrentUser } from "@/src/modules/auth/hooks/useCurrentUser";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthSessionInitializer() {
  useCurrentUser();

  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <>
      <AuthSessionInitializer />
      {children}
    </>
  );
}