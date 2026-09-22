"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import DashboardShell from "@/src/modules/dashboard/admin-dasboard/components/DashboardShell";
import AdminDashboard from "@/src/modules/dashboard/admin-dasboard/components/AdminDashboard";
import { normalizeRole, getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00696b]/30 border-t-[#00696b]" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const role = normalizeRole(user.role);

  if (role !== "admin") {
    const correctDashboard = getDashboardRouteForRole(user.role);
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-bold text-red-700">403 - Access Denied</h1>
            <p className="mt-2 text-sm text-red-600">
              You do not have permission to view the Administrator Dashboard.
            </p>
            <Link
              href={correctDashboard}
              className="mt-6 inline-block rounded-xl bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Admin Overview">
      <AdminDashboard />
    </DashboardShell>
  );
}