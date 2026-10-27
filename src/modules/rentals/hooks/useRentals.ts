import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    acceptAgreement,
    confirmAgreement,
    createManualAgreement,
    deleteOrCancelAgreement,
    getAgreement,
    getMyRental,
    getOwnerAgreement,
    getOwnerAgreements,
    getOwnerRentals,
    lookupTenant,
    resendAgreementNotification,
    setRentSplit,
    terminateRental,
    updateAgreement,
    type CreateManualAgreementPayload,
    type UpdateAgreementPayload,
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

export const useOwnerAgreements = () => {
    return useQuery({
        queryKey: ["owner-agreements"],
        queryFn: getOwnerAgreements,
    });
};

export const useOwnerAgreementDetail = (agreementId?: string) => {
    return useQuery({
        queryKey: ["owner-agreement", agreementId],
        queryFn: () => (agreementId ? getOwnerAgreement(agreementId) : Promise.resolve(null)),
        enabled: Boolean(agreementId),
    });
};

export const useCreateManualAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateManualAgreementPayload) => createManualAgreement(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["owner-agreements"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
        },
    });
};

export const useUpdateAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            agreementId,
            payload,
        }: {
            agreementId: string;
            payload: UpdateAgreementPayload;
        }) => updateAgreement(agreementId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["owner-agreements"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-agreement"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
        },
    });
};

export const useDeleteOrCancelAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agreementId: string) => deleteOrCancelAgreement(agreementId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["owner-agreements"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
        },
    });
};

export const useResendAgreement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agreementId: string) => resendAgreementNotification(agreementId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["owner-agreements"] });
        },
    });
};

export const useLookupTenant = (email: string) => {
    return useQuery({
        queryKey: ["tenant-lookup", email],
        queryFn: () => lookupTenant(email),
        enabled: Boolean(email && email.includes("@") && email.length >= 5),
    });
};
