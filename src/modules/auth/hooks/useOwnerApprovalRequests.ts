import { useQuery } from "@tanstack/react-query";
import { getOwnerApprovalRequests } from "../services/authServices";

export const ownerApprovalRequestsQueryKey = ["owner-approval-requests"] as const;

export function useOwnerApprovalRequests(enabled = true) {
    return useQuery({
        queryKey: ownerApprovalRequestsQueryKey,
        queryFn: getOwnerApprovalRequests,
        enabled,
    });
}
