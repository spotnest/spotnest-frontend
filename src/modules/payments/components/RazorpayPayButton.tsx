"use client";

import {
    Loader2,
    ShieldCheck,
    FileText,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/src/store/hook";
import { userUpdated } from "@/src/store/slices/authSlice";
import { getCurrentUser } from "@/src/modules/auth/services/authServices";
import {
    useCreatePaymentOrder,
    useVerifyPayment,
} from "../hooks/usePayments";
import {
    useMyRental,
    useAcceptAgreement,
} from "@/src/modules/rentals/hooks/useRentals";
import { openRazorpayCheckout } from "../utils/razorpay";
import type { PaymentVerificationPayload } from "../types";
import type { TenantRentalResponse } from "@/src/modules/rentals/services/rentalService";

interface RazorpayPayButtonProps {
    bookingId: string;
    type: "ADVANCE" | "MONTHLY_RENT";
    label: string;
    billingMonth?: string;
    agreement?: TenantRentalResponse["agreement"];
}

const formatDate = (value?: string | Date | null): string => {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMoney = (value?: number | null): string => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "Not specified";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

export default function RazorpayPayButton({
    bookingId,
    type,
    label,
    billingMonth,
    agreement: agreementProp,
}: RazorpayPayButtonProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const queryClient = useQueryClient();
    const createOrder = useCreatePaymentOrder();
    const verify = useVerifyPayment();
    const acceptMutation = useAcceptAgreement();
    const rentalQuery = useMyRental(bookingId);

    const [isRetryingAgreement, setIsRetryingAgreement] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingVerification, setPendingVerification] =
        useState<PaymentVerificationPayload | null>(null);
    const [hasConfirmedTerms, setHasConfirmedTerms] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);
    const [clockNow, setClockNow] = useState(() => Date.now());

    const isAdvancePayment = type === "ADVANCE";

    const rentalData = rentalQuery.data;
    const agreement = agreementProp !== undefined ? agreementProp : rentalData?.agreement;
    const rental = rentalData?.rental;

    const isApprovedPendingPayment =
        agreement?.status === "APPROVED_PENDING_PAYMENT";
    const isPendingTenant = agreement?.status === "PENDING_TENANT";
    const isPendingOwner = agreement?.status === "PENDING_OWNER";
    const isExpired = agreement?.status === "EXPIRED";

    // Strictly derive payment deadline from the backend-issued timestamp
    const paymentDeadlineMs = agreement?.paymentDeadline
        ? new Date(agreement.paymentDeadline).getTime()
        : Number.NaN;

    useEffect(() => {
        if (
            !isAdvancePayment ||
            !isApprovedPendingPayment ||
            !Number.isFinite(paymentDeadlineMs)
        ) {
            return;
        }

        const updateClock = () => setClockNow(Date.now());
        updateClock();

        const intervalId = window.setInterval(updateClock, 500);
        return () => window.clearInterval(intervalId);
    }, [
        isAdvancePayment,
        isApprovedPendingPayment,
        paymentDeadlineMs,
    ]);

    const remainingMs = Number.isFinite(paymentDeadlineMs)
        ? Math.max(0, paymentDeadlineMs - clockNow)
        : 0;

    const isDeadlineExpired =
        isExpired ||
        (isApprovedPendingPayment &&
            (!Number.isFinite(paymentDeadlineMs) || remainingMs <= 0));

    // When the countdown reaches 0 while mounted, refetch to sync authoritative server state
    useEffect(() => {
        if (
            isAdvancePayment &&
            isApprovedPendingPayment &&
            Number.isFinite(paymentDeadlineMs) &&
            remainingMs <= 0
        ) {
            void rentalQuery.refetch();
        }
    }, [
        isAdvancePayment,
        isApprovedPendingPayment,
        paymentDeadlineMs,
        remainingMs,
        rentalQuery,
    ]);

    const canPayAdvance =
        isApprovedPendingPayment &&
        Number.isFinite(paymentDeadlineMs) &&
        remainingMs > 0;

    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const countdownDays = Math.floor(remainingSeconds / 86400);
    const countdownHours = Math.floor((remainingSeconds % 86400) / 3600);
    const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const countdownSecs = remainingSeconds % 60;

    let countdownText = `${countdownMinutes.toString().padStart(2, "0")}:${countdownSecs.toString().padStart(2, "0")}`;
    if (countdownDays > 0) {
        countdownText = `${countdownDays}d ${countdownHours.toString().padStart(2, "0")}h ${countdownMinutes.toString().padStart(2, "0")}m`;
    } else if (countdownHours > 0) {
        countdownText = `${countdownHours.toString().padStart(2, "0")}:${countdownMinutes.toString().padStart(2, "0")}:${countdownSecs.toString().padStart(2, "0")}`;
    }

    const handleRetryAgreement = async () => {
        setIsRetryingAgreement(true);
        try {
            await queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
            await queryClient.invalidateQueries({ queryKey: ["bookings"] });
            await rentalQuery.refetch();
        } finally {
            setIsRetryingAgreement(false);
        }
    };

    const isVerificationRetry = pendingVerification !== null;

    const handleAcceptAgreement = async () => {
        if (!agreement || agreement.status !== "PENDING_TENANT") {
            setAcceptError("This agreement is no longer awaiting your acceptance.");
            return;
        }

        if (!hasConfirmedTerms) {
            setAcceptError(
                "Please read and confirm the terms and conditions checkbox before accepting."
            );
            return;
        }

        setAcceptError(null);

        try {
            await acceptMutation.mutateAsync({
                agreementId: agreement.id,
                acceptedTerms: true,
            });
            await rentalQuery.refetch();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                (err as Error)?.message ||
                "Failed to accept the rental agreement.";
            setAcceptError(message);
        }
    };

    const verifyAndContinue = async (
        payload: PaymentVerificationPayload
    ) => {
        const verifyResult = await verify.mutateAsync(payload);

        setPendingVerification(null);

        if (type === "ADVANCE") {
            // Update auth state in Redux so user role transitions to tenant immediately
            if (verifyResult?.user) {
                dispatch(userUpdated(verifyResult.user));
            } else {
                try {
                    const freshUser = await getCurrentUser();
                    if (freshUser?.user) {
                        dispatch(userUpdated(freshUser.user));
                    }
                } catch {
                    // Non-fatal if session refresh fails
                }
            }

            // Invalidate query caches
            await queryClient.invalidateQueries({ queryKey: ["tenant"] });
            await queryClient.invalidateQueries({ queryKey: ["bookings"] });
            await queryClient.invalidateQueries({ queryKey: ["tenant-rental"] });
            await queryClient.invalidateQueries({ queryKey: ["tenant-agreement"] });
            await queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
            await queryClient.invalidateQueries({ queryKey: ["tenant", "dashboard"] });
            await rentalQuery.refetch();

            // Navigate tenant directly to Tenant Dashboard
            router.push("/tenant/dashboard");
        } else {
            router.refresh();
        }
    };

    const startPayment = async () => {
        setError(null);

        if (isProcessing) {
            return;
        }

        if (isAdvancePayment && !pendingVerification) {
            if (!canPayAdvance) {
                setError(
                    "This rental request has expired or its payment deadline is unavailable. Please submit a new rental request."
                );
                await rentalQuery.refetch();
                return;
            }
        }

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
                description:
                    type === "ADVANCE"
                        ? "Rental advance payment"
                        : `Monthly rent for ${billingMonth}`,
                order_id: order.orderId,
                theme: {
                    color: "#00696b",
                },
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
                        setError(
                            "Payment succeeded, but verification did not finish. Retry verification below."
                        );
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setIsProcessing(false),
                },
            });
        } catch (paymentError) {
            setError(
                paymentError instanceof Error
                    ? paymentError.message
                    : "Unable to start payment."
            );

            setIsProcessing(false);
        }
    };

    const paymentDisabled =
        isProcessing ||
        (isAdvancePayment &&
            (!isApprovedPendingPayment || !canPayAdvance || isDeadlineExpired) &&
            !isVerificationRetry);

    const propertyId =
        rental?.property?.id ??
        (rentalData?.rental?.property as unknown as { _id?: string })?._id ??
        "";

    return (
        <div className="space-y-4">
            {isAdvancePayment && !isVerificationRetry && (
                <section className="overflow-hidden rounded-xl border border-teal-200 bg-white">
                    <div className="flex items-center gap-3 border-b border-teal-100 bg-teal-50 p-4">
                        <ShieldCheck
                            className="h-6 w-6 shrink-0 text-teal-800"
                            aria-hidden="true"
                        />

                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Rental Agreement
                            </h3>

                            <p className="text-sm text-gray-600">
                                Review agreement terms, confirm acceptance, and pay advance.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 p-4">
                        {rentalQuery.isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading rental agreement...
                            </div>
                        ) : rentalQuery.isError ? (
                            <div className="space-y-2">
                                <p className="text-sm text-red-700">
                                    Unable to load the agreement details.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleRetryAgreement}
                                    disabled={isRetryingAgreement}
                                    className="text-sm font-semibold text-teal-800 underline disabled:opacity-50"
                                >
                                    {isRetryingAgreement ? "Retrying..." : "Retry loading agreement"}
                                </button>
                            </div>
                        ) : agreement ? (
                            <>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Agreement Status
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    agreement.status === "ACTIVE"
                                                        ? "bg-[#d9f4f3] text-[#00696b]"
                                                        : agreement.status === "APPROVED_PENDING_PAYMENT"
                                                          ? "bg-amber-100 text-amber-900"
                                                          : agreement.status === "PENDING_OWNER"
                                                            ? "bg-blue-100 text-blue-900"
                                                            : agreement.status === "EXPIRED"
                                                              ? "bg-red-100 text-red-900"
                                                              : "bg-yellow-100 text-yellow-900"
                                                }`}
                                            >
                                                {agreement.status.replaceAll("_", " ")}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Monthly Rent
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            {formatMoney(agreement.monthlyRent)}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Security Deposit
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            {formatMoney(
                                                agreement.securityDepositShare
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">
                                            Lease Period
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {formatDate(agreement.leaseStart)}
                                            {" – "}
                                            {formatDate(agreement.leaseEnd)}
                                        </p>
                                    </div>
                                </div>

                                {/* Acceptance Indicators */}
                                <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                        Acceptance Status
                                    </p>

                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-600">Tenant:</span>
                                            {agreement.tenantAcceptedAt ? (
                                                <span className="font-semibold text-emerald-700">
                                                    Accepted on {formatDate(agreement.tenantAcceptedAt)}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-amber-700">
                                                    Not accepted
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-600">Property Owner:</span>
                                            {agreement.ownerAcceptedAt ? (
                                                <span className="font-semibold text-emerald-700">
                                                    Approved on {formatDate(agreement.ownerAcceptedAt)}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-amber-700">
                                                    Not accepted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* State 1: Tenant Acceptance Action */}
                                {isPendingTenant && (
                                    <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
                                        <div className="flex items-start gap-2.5">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">
                                                    Tenant Acceptance Required
                                                </p>
                                                <p className="mt-0.5 text-xs text-amber-800">
                                                    Please review the terms and conditions below. Accept the agreement so the owner can give final approval.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-800">
                                            <input
                                                type="checkbox"
                                                checked={hasConfirmedTerms}
                                                onChange={(e) => {
                                                    setHasConfirmedTerms(e.target.checked);
                                                    setAcceptError(null);
                                                }}
                                                disabled={acceptMutation.isPending}
                                                className="mt-1 h-4 w-4 shrink-0 accent-[#00696b]"
                                            />
                                            <span>
                                                I confirm that I have read and agree to the rental agreement terms and conditions displayed below.
                                            </span>
                                        </label>

                                        {acceptError && (
                                            <p className="text-xs font-semibold text-red-700" role="alert">
                                                {acceptError}
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleAcceptAgreement}
                                            disabled={!hasConfirmedTerms || acceptMutation.isPending}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {acceptMutation.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Accepting Agreement...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    Accept Rental Agreement
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* State 2: Awaiting Owner Approval */}
                                {isPendingOwner && (
                                    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">
                                                Awaiting Property Owner Approval
                                            </p>
                                            <p className="mt-0.5 text-xs text-blue-800">
                                                You have accepted the agreement. The owner will review and confirm. Once approved, your 2-minute advance payment countdown will start automatically.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* State 3 & 4: Active Countdown / Expired State */}
                                {isApprovedPendingPayment && (
                                    <div
                                        className={`rounded-xl border p-4 ${
                                            isDeadlineExpired
                                                ? "border-red-200 bg-red-50"
                                                : "border-amber-300 bg-amber-50"
                                        }`}
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {isDeadlineExpired ? (
                                            <div>
                                                <p className="font-bold text-red-800">
                                                    Rental request expired
                                                </p>
                                                <p className="mt-1 text-sm text-red-700">
                                                    This rental request has expired. Please submit a new rental request.
                                                </p>
                                                {propertyId ? (
                                                    <Link
                                                        href={`/properties/${propertyId}`}
                                                        className="mt-3 inline-block text-sm font-semibold text-red-800 underline"
                                                    >
                                                        Submit a new rental request →
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push("/properties")}
                                                        className="mt-3 text-sm font-semibold text-red-800 underline"
                                                    >
                                                        Browse available properties →
                                                    </button>
                                                )}
                                            </div>
                                        ) : !Number.isFinite(paymentDeadlineMs) ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-amber-900 font-semibold">
                                                    Payment deadline information is missing or unverified.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => rentalQuery.refetch()}
                                                    className="text-xs font-bold text-[#00696b] underline"
                                                >
                                                    Refresh status
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                 <div>
                                                    <p className="text-sm font-bold text-amber-900">
                                                        Owner Approved — Advance Payment Required
                                                    </p>
                                                    <p className="text-xs text-amber-800">
                                                        Complete your advance payment before the 72-hour deadline expires.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-amber-900" />
                                                    <span className="font-mono text-3xl font-extrabold text-amber-950">
                                                        {countdownText}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* State 5: Explicit EXPIRED */}
                                {isExpired && (
                                    <div
                                        className="rounded-xl border border-red-200 bg-red-50 p-4"
                                        role="alert"
                                    >
                                        <p className="font-bold text-red-800">
                                            Rental request expired
                                        </p>
                                        <p className="mt-1 text-sm text-red-700">
                                            This rental request has expired. Please submit a new rental request.
                                        </p>
                                        {propertyId ? (
                                            <Link
                                                href={`/properties/${propertyId}`}
                                                className="mt-3 inline-block text-sm font-semibold text-red-800 underline"
                                            >
                                                Submit a new rental request →
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => router.push("/properties")}
                                                className="mt-3 text-sm font-semibold text-red-800 underline"
                                            >
                                                Browse available properties →
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Terms & Conditions Display */}
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <FileText
                                            className="h-5 w-5 text-teal-800"
                                            aria-hidden="true"
                                        />

                                        <h4 className="font-semibold text-gray-900">
                                            Terms & Conditions
                                        </h4>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-700">
                                        {agreement.terms?.trim() ||
                                            "No rental terms are available in this agreement. Contact the property owner before paying."}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                                <p className="text-sm font-semibold text-amber-900">
                                    Rental agreement is ready for generation or retrieval.
                                </p>
                                <p className="text-xs text-amber-800">
                                    Click retry below to load your agreement terms and payment details.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleRetryAgreement}
                                    disabled={isRetryingAgreement}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#00696b] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#004f51] disabled:opacity-50"
                                >
                                    {isRetryingAgreement ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Loading agreement...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                            Retry loading agreement
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {error && (
                <p
                    className="text-sm font-semibold text-red-700"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={startPayment}
                disabled={paymentDisabled}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isProcessing && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}

                {isProcessing
                    ? "Processing..."
                    : isVerificationRetry
                      ? "Retry verification"
                      : isAdvancePayment
                        ? isDeadlineExpired
                          ? "Rental request expired"
                          : isPendingTenant
                            ? "Accept Agreement Above to Proceed"
                            : isPendingOwner
                              ? "Awaiting Owner Approval"
                              : isApprovedPendingPayment
                                ? label
                                : label
                        : label}
            </button>

            {isAdvancePayment && !isVerificationRetry && (
                <p className="text-xs leading-5 text-gray-500 text-center">
                    Advance payment requires both parties&apos; acceptance and must be completed within the 2-minute deadline.
                </p>
            )}
        </div>
    );
}
