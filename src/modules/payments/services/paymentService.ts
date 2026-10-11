import api from "@/src/lib/axios";
import type { ApiResponse } from "@/src/modules/bookings/types";
import type { PaymentVerificationPayload, PaymentVerificationResult, RazorpayOrderData } from "../types";

export const createPaymentOrder = async (input: {
    bookingId: string;
    type: "ADVANCE" | "MONTHLY_RENT";
    billingMonth?: string;
}): Promise<RazorpayOrderData> => {
    const path = input.type === "ADVANCE" ? "/payments/advance/create-order" : "/payments/monthly/create-order";
    const response = await api.post<ApiResponse<RazorpayOrderData>>(path, {
        bookingId: input.bookingId,
        ...(input.billingMonth ? { billingMonth: input.billingMonth } : {}),
    });
    return response.data.data;
};

export const verifyPayment = async (
    payload: PaymentVerificationPayload
): Promise<PaymentVerificationResult> => {
    const response = await api.post<ApiResponse<PaymentVerificationResult>>("/payments/verify", payload);
    return response.data.data;
};
