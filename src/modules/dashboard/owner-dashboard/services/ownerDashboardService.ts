import api from "@/src/lib/axios";
import type { OwnerDashboardData } from "../types/ownerDashboard";

export const getOwnerDashboard = async (): Promise<OwnerDashboardData> =>
    (await api.get<{ success: boolean; data: OwnerDashboardData }>("/owner/dashboard")).data.data;
