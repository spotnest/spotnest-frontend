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
            // Same keys the realtime "payment" event refreshes (bookings,
            // tenant dashboard/payments, tenant rental, owner rentals).
            for (const queryKey of queryKeysForDashboardScope.payment) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
    });
};
