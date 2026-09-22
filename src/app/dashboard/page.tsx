"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
      } else {
        const targetRoute = getDashboardRouteForRole(user.role);
        router.replace(targetRoute);
      }
    }
  }, [initialized, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00696b]/30 border-t-[#00696b]" />
    </div>
  );
}