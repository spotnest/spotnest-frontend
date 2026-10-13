import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";
import { queryKeysForDashboardScope } from "@/src/modules/dashboard/constants/realtimeQueryKeys";

export const useCreatePaymentOrder = () =>
    useMutation({
        mutationFn: createPaymentOrder,
    });

export const useVerifyPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyPayment,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["bookings"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-agreement"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-rentals"] });
            void queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
        },
    });
};
