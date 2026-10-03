import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";

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
        },
    });
};
