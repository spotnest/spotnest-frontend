import apiClient from "@/src/lib/axios";
import type { AdminDashboardResponse } from "../types/dashboard";

interface DashboardApiResponse {
    success: boolean;
    data: AdminDashboardResponse;
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
    const response = await apiClient.get<DashboardApiResponse>("/dashboard/admin");
    return response.data.data;
}
