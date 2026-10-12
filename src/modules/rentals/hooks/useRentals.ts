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

export const useMyRental = (bookingId?: string) => {
    return useQuery({
        queryKey: ["tenant-rental", bookingId ?? "latest"],
        queryFn: () => getMyRental(bookingId),
        refetchInterval: (query) => {
            const agreement = query.state.data?.agreement;
            if (
                agreement?.status === "PENDING_OWNER" ||
                agreement?.status === "APPROVED_PENDING_PAYMENT"
            ) {
                return 3000;
            }
            return false;
        },
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
        mutationFn: ({
            agreementId,
            acceptedTerms,
        }: {
            agreementId: string;
            acceptedTerms: boolean;
        }) => acceptAgreement(agreementId, acceptedTerms),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["tenant-rental"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["tenant-agreement"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["tenant-payments"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["bookings"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["owner-rentals"],
            });
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
            void queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
            void queryClient.invalidateQueries({ queryKey: ["bookings"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-agreement"] });
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
