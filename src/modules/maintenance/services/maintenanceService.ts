import axios from "@/src/lib/axios";
import type {
    EligibleProperty,
    ListMaintenanceParams,
    ListMaintenanceResponse,
    MaintenanceRequest,
    MaintenanceSummary,
    UpdateStatusPayload,
} from "../types/maintenance";

export const getEligibleProperties = async (): Promise<EligibleProperty[]> => {
    const response = await axios.get<EligibleProperty[]>("/maintenance/tenant/eligible-properties");
    return response.data;
};

export const getTenantRequests = async (
    params?: ListMaintenanceParams
): Promise<ListMaintenanceResponse> => {
    const response = await axios.get<ListMaintenanceResponse>("/maintenance/tenant/requests", {
        params,
    });
    return response.data;
};

export const getOwnerRequests = async (
    params?: ListMaintenanceParams
): Promise<ListMaintenanceResponse> => {
    const response = await axios.get<ListMaintenanceResponse>("/maintenance/owner/requests", {
        params,
    });
    return response.data;
};

export const getOwnerSummary = async (): Promise<MaintenanceSummary> => {
    const response = await axios.get<MaintenanceSummary>("/maintenance/owner/summary");
    return response.data;
};

export const getRequestDetails = async (id: string): Promise<MaintenanceRequest> => {
    const response = await axios.get<MaintenanceRequest>(`/maintenance/${id}`);
    return response.data;
};

export const createMaintenanceRequest = async (formData: FormData): Promise<MaintenanceRequest> => {
    const response = await axios.post<MaintenanceRequest>("/maintenance/tenant/requests", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const updateMaintenanceStatus = async (
    id: string,
    payload: UpdateStatusPayload
): Promise<MaintenanceRequest> => {
    const response = await axios.patch<MaintenanceRequest>(`/maintenance/${id}/status`, payload);
    return response.data;
};

export const getAdminRequests = async (params?: {
    status?: string;
    category?: string;
    priority?: string;
}): Promise<ListMaintenanceResponse> => {
    const response = await axios.get<ListMaintenanceResponse>("/maintenance/admin/all", {
        params,
    });
    return response.data;
};


