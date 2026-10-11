import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createMaintenanceRequest,
    getEligibleProperties,
    getOwnerRequests,
    getOwnerSummary,
    getRequestDetails,
    getTenantRequests,
    updateMaintenanceStatus,
} from "../services/maintenanceService";
import type { ListMaintenanceParams, UpdateStatusPayload } from "../types/maintenance";

export const maintenanceKeys = {
    all: ["maintenance"] as const,
    tenantRequests: (params?: ListMaintenanceParams) => ["maintenance", "tenant", params] as const,
    ownerRequests: (params?: ListMaintenanceParams) => ["maintenance", "owner", params] as const,
    ownerSummary: () => ["maintenance", "owner-summary"] as const,
    eligibleProperties: () => ["maintenance", "eligible-properties"] as const,
    detail: (id: string) => ["maintenance", "detail", id] as const,
};

export const useEligibleProperties = () => {
    return useQuery({
        queryKey: maintenanceKeys.eligibleProperties(),
        queryFn: getEligibleProperties,
    });
};

export const useTenantMaintenanceRequests = (params?: ListMaintenanceParams) => {
    return useQuery({
        queryKey: maintenanceKeys.tenantRequests(params),
        queryFn: () => getTenantRequests(params),
    });
};

export const useOwnerMaintenanceRequests = (params?: ListMaintenanceParams) => {
    return useQuery({
        queryKey: maintenanceKeys.ownerRequests(params),
        queryFn: () => getOwnerRequests(params),
    });
};

export const useOwnerMaintenanceSummary = () => {
    return useQuery({
        queryKey: maintenanceKeys.ownerSummary(),
        queryFn: getOwnerSummary,
    });
};

export const useMaintenanceDetails = (id: string) => {
    return useQuery({
        queryKey: maintenanceKeys.detail(id),
        queryFn: () => getRequestDetails(id),
        enabled: Boolean(id),
    });
};

export const useCreateMaintenanceRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => createMaintenanceRequest(formData),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
            void queryClient.invalidateQueries({ queryKey: ["tenant"] });
        },
    });
};

export const useUpdateMaintenanceStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
            updateMaintenanceStatus(id, payload),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
            void queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) });
            void queryClient.invalidateQueries({ queryKey: ["tenant"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-summary"] });
        },
    });
};
