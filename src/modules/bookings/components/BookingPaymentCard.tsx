"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/src/modules/properties";
import { useCreateBooking } from "@/src/modules/bookings/hooks/useBookings";
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestCreated, setRequestCreated] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to send rental request.");
        } finally {
            setIsProcessing(false);
        }
    };

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
