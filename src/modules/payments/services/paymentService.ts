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

export interface AdminPaymentItem {
    _id: string;
    bookingId?: string;
    type: "ADVANCE" | "MONTHLY_RENT";
    amount: number;
    currency: string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "OVERDUE";
    billingMonth?: string;
    dueDate?: string;
    paidAt?: string;
    lateFeeApplied?: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    created_at: string;
    tenant?: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    } | null;
    owner?: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    } | null;
    property?: {
        _id: string;
        title: string;
        address?: { street?: string; city?: string; state?: string };
    } | null;
}

export interface AdminPaymentsSummary {
    totalPaid: number;
    totalLateFees: number;
    totalAdvancePaid: number;
    totalRentPaid: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
}

export interface AdminPaymentsResponse {
    summary: AdminPaymentsSummary;
    payments: AdminPaymentItem[];
}

export const getAdminPayments = async (params?: {
    status?: string;
    type?: string;
    search?: string;
}): Promise<AdminPaymentsResponse> => {
    const response = await api.get<{ success: boolean; data: AdminPaymentsResponse }>("/payments/admin/all", {
        params,
    });
    return response.data.data;
};

