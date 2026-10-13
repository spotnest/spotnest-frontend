"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/src/store/hook";
import { getOwnerDashboard } from "../services/ownerDashboardService";

export const ownerDashboardKeys = {
    summary: ["owner-dashboard"] as const,
};

export const useOwnerDashboard = () => {
    const role = useAppSelector((state) => state.auth.user?.role);
    return useQuery({
        queryKey: ownerDashboardKeys.summary,
        queryFn: getOwnerDashboard,
        enabled: role === "owner",
    });
};
