"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreatePaymentOrder, useVerifyPayment } from "../hooks/usePayments";
import { openRazorpayCheckout } from "../utils/razorpay";
import type { PaymentVerificationPayload } from "../types";

interface RazorpayPayButtonProps {
    bookingId: string;
    type: "ADVANCE" | "MONTHLY_RENT";
    label: string;
    billingMonth?: string;
}

export default function RazorpayPayButton({ bookingId, type, label, billingMonth }: RazorpayPayButtonProps) {
    const router = useRouter();
    const createOrder = useCreatePaymentOrder();
    const verify = useVerifyPayment();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingVerification, setPendingVerification] = useState<PaymentVerificationPayload | null>(null);

    const verifyAndContinue = async (payload: PaymentVerificationPayload) => {
        await verify.mutateAsync(payload);
        setPendingVerification(null);
        if (type === "ADVANCE") router.push(`/bookings?bookingId=${bookingId}`);
        else router.refresh();
    };

    const startPayment = async () => {
        setError(null);
        setIsProcessing(true);
        try {
            if (pendingVerification) {
                await verifyAndContinue(pendingVerification);
                return;
            }
            const order = await createOrder.mutateAsync({
                bookingId,
                type,
                ...(billingMonth ? { billingMonth } : {}),
            });

            await openRazorpayCheckout({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "SpotNest",
                description: type === "ADVANCE" ? "Rental advance payment" : `Monthly rent for ${billingMonth}`,
                order_id: order.orderId,
                theme: { color: "#00696b" },
                handler: async (response) => {
                    const verification: PaymentVerificationPayload = {
                        bookingId,
                        type,
                        ...(billingMonth ? { billingMonth } : {}),
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    };
                    setPendingVerification(verification);
                    try {
                        await verifyAndContinue(verification);
                    } catch {
                        setError("Payment succeeded, but verification did not finish. Retry verification below.");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setIsProcessing(false),
                },
            });
        } catch (paymentError) {
            setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-2">
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button
                type="button"
                onClick={startPayment}
                disabled={isProcessing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? "Processing..." : pendingVerification ? "Retry verification" : label}
            </button>
        </div>
    );
}
