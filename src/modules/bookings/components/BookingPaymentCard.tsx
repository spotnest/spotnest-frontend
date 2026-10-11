"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/src/modules/properties";
import { useCreateBooking, useMyBookings } from "@/src/modules/bookings/hooks/useBookings";
import RazorpayPayButton from "@/src/modules/payments/components/RazorpayPayButton";
import { useAppSelector } from "@/src/store/hook";

interface BookingPaymentCardProps {
    propertyId: string;
    propertyTitle: string;
    propertyPrice: number;
    advanceAmount: number;
}

export default function BookingPaymentCard({
    propertyId,
    propertyTitle,
    propertyPrice,
    advanceAmount,
}: BookingPaymentCardProps) {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    const createBookingMutation = useCreateBooking();
    const { data: myBookings = [] } = useMyBookings();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestCreated, setRequestCreated] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const existingBooking = myBookings.find((b) => {
        const pId = typeof b.propertyId === "string" ? b.propertyId : (b.propertyId as { _id?: string })?._id;
        return pId === propertyId && !["REJECTED", "COMPLETED"].includes(b.status);
    });

    const isPaidAndActive =
        existingBooking?.paymentStatus === "PAID" ||
        ["CONFIRMED", "ACTIVE"].includes(existingBooking?.status ?? "");

    const isApprovedAndPendingPayment =
        existingBooking?.status === "APPROVED" &&
        existingBooking?.paymentStatus === "ADVANCE_PAYMENT_PENDING";

    const isPendingReview = existingBooking?.status === "PENDING";

    const handlePayment = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (!startDate || !endDate) {
            setError("Choose your requested rental start and end dates.");
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            const booking = await createBookingMutation.mutateAsync({
                propertyId,
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                endDate: new Date(`${endDate}T00:00:00.000Z`).toISOString(),
                notes: `Rental booking for ${propertyTitle}`,
            });
            setRequestCreated(true);
            router.push(`/bookings?bookingId=${booking._id}`);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || "Unable to send rental request.";
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    // State 1: User has already paid the advance and rental is active
    if (isPaidAndActive) {
        return (
            <div className="mt-6 rounded-2xl border border-[#00696b]/30 bg-[#f0fbfb] p-5 text-center shadow-xs">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#00696b]/10 text-[#00696b]">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-base font-bold text-[#00696b]">You Have an Active Rental</h3>
                <p className="mt-1 text-xs text-[#44474d]">
                    Your advance payment is confirmed. View your rental agreement, shared occupants, and monthly rent in the Tenant Portal.
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/tenant/dashboard/rental")}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                >
                    Go to Tenant Portal →
                </button>
            </div>
        );
    }

    // State 2: Owner approved the request; advance payment is pending
    if (isApprovedAndPendingPayment) {
        return (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Rental Request Approved!</p>
                <h3 className="mt-1 text-base font-bold text-[#191c1d]">Advance Payment Required</h3>
                <p className="mt-1 text-xs text-amber-900/80">
                    The owner approved your rental request. Pay the advance deposit to confirm your tenancy and activate your rental.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-3 text-sm">
                    <span className="text-[#75777e]">Advance Amount:</span>
                    <span className="font-bold text-[#191c1d]">{formatPrice(existingBooking.advanceAmount)}</span>
                </div>
                <div className="mt-4">
                    <RazorpayPayButton
                        bookingId={existingBooking._id}
                        type="ADVANCE"
                        label={`Pay Advance (${formatPrice(existingBooking.advanceAmount)})`}
                    />
                </div>
            </div>
        );
    }

    // State 3: Request sent and awaiting owner review
    if (isPendingReview) {
        return (
            <div className="mt-6 rounded-2xl border border-[#dfe3e6] bg-[#f8f9fa] p-5 text-center shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#00696b]">Request Submitted</p>
                <h3 className="mt-1 text-base font-bold text-[#191c1d]">Waiting for Owner Review</h3>
                <p className="mt-1 text-xs text-[#75777e]">
                    You have requested to rent this property from{" "}
                    <span className="font-medium text-[#191c1d]">
                        {new Date(existingBooking.startDate).toLocaleDateString("en-IN")}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-[#191c1d]">
                        {new Date(existingBooking.endDate).toLocaleDateString("en-IN")}
                    </span>
                    .
                </p>
                <button
                    type="button"
                    onClick={() => router.push(`/bookings?bookingId=${existingBooking._id}`)}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[#c5c6cd] bg-white px-4 py-2.5 text-sm font-semibold text-[#191c1d] transition hover:bg-[#f3f4f5]"
                >
                    View Request Status
                </button>
            </div>
        );
    }

    // Default State: New rental request form
    return (
        <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-[#dfe3e6] bg-[#f8f9fa] p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#75777e]">Monthly rent</span>
                    <span className="font-semibold text-[#191c1d]">{formatPrice(propertyPrice)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#dfe3e6] pt-2 text-sm">
                    <span className="text-[#75777e]">Advance if approved</span>
                    <span className="font-semibold text-[#191c1d]">{formatPrice(advanceAmount)}</span>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#44474d]">
                    Rental starts
                    <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="mt-1 h-11 w-full rounded-lg border border-[#c5c6cd] bg-white px-3 text-sm"
                        required
                    />
                </label>
                <label className="text-xs font-semibold text-[#44474d]">
                    Rental ends
                    <input
                        type="date"
                        min={startDate || new Date().toISOString().slice(0, 10)}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="mt-1 h-11 w-full rounded-lg border border-[#c5c6cd] bg-white px-3 text-sm"
                        required
                    />
                </label>
            </div>

            {error && (
                <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                </p>
            )}

            {requestCreated && (
                <p className="text-sm font-medium text-[#00696b]" role="status">
                    Request sent successfully. Status: Pending Owner Approval.
                </p>
            )}

            <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing || requestCreated}
                className="mt-2 w-full rounded-lg bg-[#00696b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isProcessing ? (
                    <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </span>
                ) : (
                    "Request to Rent"
                )}
            </button>
        </div>
    );
}
