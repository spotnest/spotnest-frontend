import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    acceptAgreement,
    confirmAgreement,
    getAgreement,
    getMyRental,
    getOwnerRentals,
    setRentSplit,
    terminateRental,
} from "../services/rentalService";

export const useMyRental = () => {
    return useQuery({
        queryKey: ["tenant-rental"],
        queryFn: getMyRental,
    });
};

export const useAgreement = (agreementId?: string) => {
    return useQuery({
        queryKey: ["tenant-agreement", agreementId],
        queryFn: () => getAgreement(agreementId),
    });
};

export const useAcceptAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agreementId: string) => acceptAgreement(agreementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
            queryClient.invalidateQueries({ queryKey: ["tenant-agreement"] });
            queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
        },
    });
};

export const useOwnerRentals = () => {
    return useQuery({
        queryKey: ["owner-rentals"],
        queryFn: getOwnerRentals,
    });
};

export const useConfirmAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agreementId: string) => confirmAgreement(agreementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
        },
    });
};

export const useSetRentSplit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            rentalId,
            payload,
        }: {
            rentalId: string;
            payload: {
                splitMode: "EQUAL" | "CUSTOM";
                occupants: Array<{
                    tenantEmail?: string;
                    tenantId?: string;
                    rentAmount?: number;
                    securityDepositShare?: number;
                }>;
            };
        }) => setRentSplit(rentalId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
        },
    });
};

export const useTerminateRental = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ rentalId, reason }: { rentalId: string; reason?: string }) =>
            terminateRental(rentalId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
        },
    });
};
