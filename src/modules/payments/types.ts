export interface RazorpayOrderData {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

export interface PaymentVerificationPayload {
    bookingId: string;
    type: "ADVANCE" | "MONTHLY_RENT";
    billingMonth?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface PaymentVerificationResult {
    bookingId: string;
    paymentStatus: "PAID" | "PENDING" | "FAILED";
    bookingStatus: "APPROVED" | "CONFIRMED" | "ACTIVE";
}
