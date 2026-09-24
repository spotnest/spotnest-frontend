import { ReactNode } from "react";

export interface DashboardShellProps {
    children: ReactNode;
    role?: "admin" | "owner" | "tenant";
}
