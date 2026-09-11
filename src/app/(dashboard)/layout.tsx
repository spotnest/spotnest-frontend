import type { ReactNode } from "react";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}
