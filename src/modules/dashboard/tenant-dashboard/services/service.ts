import api from "@/src/lib/axios";
import type { CreateMaintenanceInput, MaintenanceRequest, TenantDashboardData, TenantMaintenanceData, TenantPaymentsData, TenantRental } from "../types/types";

export const getTenantDashboard = async () => (await api.get<TenantDashboardData>("/tenant/dashboard")).data;
export const getTenantRental = async () => (await api.get<TenantRental | null>("/tenant/rental")).data;
export const getTenantPayments = async () => (await api.get<TenantPaymentsData>("/tenant/payments")).data;
export const getTenantMaintenance = async () => (await api.get<TenantMaintenanceData>("/tenant/maintenance")).data;
export const createMaintenance = async (input: CreateMaintenanceInput) => (await api.post<MaintenanceRequest>("/tenant/maintenance", input)).data;
