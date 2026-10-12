
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Loader2,
    CheckCircle,
    FileText,
    Users,
    ShieldAlert,
    CreditCard,
    Clock,
} from "lucide-react";

import {
    useAcceptAgreement,
    useMyRental,
} from "@/src/modules/rentals/hooks/useRentals";

import RazorpayPayButton from "@/src/modules/payments/components/RazorpayPayButton";

import {
    date,
    EmptyRental,
    money,
    PageState,
    RentalHero,
    Status,
} from "./components";

export default function TenantRentalPage() {
    const rentalQuery = useMyRental();
    const acceptMutation = useAcceptAgreement();

    const [isAgreementModalOpen, setIsAgreementModalOpen] =
        useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

    const data = rentalQuery.data;
    const rental = data?.rental;
    const agreement = data?.agreement;
    const myOccupant = data?.myOccupant;
    const occupants = data?.occupants ?? [];
    const payments = data?.payments ?? [];

    const handleOpenAgreement = () => {
        setHasAcceptedTerms(false);
        setAcceptError(null);
        setIsAgreementModalOpen(true);
    };

    const handleCloseAgreement = () => {
        if (acceptMutation.isPending) return;

        setIsAgreementModalOpen(false);
        setHasAcceptedTerms(false);
        setAcceptError(null);
    };

    const handleAcceptAgreement = async () => {
        if (!agreement || agreement.status !== "PENDING_TENANT") {
            setAcceptError("This agreement is no longer awaiting your acceptance.");
            return;
        }

        if (!hasAcceptedTerms) {
            setAcceptError(
                "Please read and accept the terms and conditions before continuing."
            );
            return;
        }

        setAcceptError(null);

        try {
            await acceptMutation.mutateAsync({
                agreementId: agreement.id,
                acceptedTerms: true,
            });

            setIsAgreementModalOpen(false);
            setHasAcceptedTerms(false);
        } catch (err: unknown) {
            const error = err as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
                message?: string;
            };

            setAcceptError(
                error.response?.data?.message ??
                    error.message ??
                    "Failed to accept the agreement. Please try again."
            );
        }
    };

    const pendingMonthlyPayment = payments.find(
        (payment) =>
            payment.type === "MONTHLY_RENT" &&
            ["pending", "due", "overdue"].includes(
                payment.status.toLowerCase()
            )
    );

    if (!rental) {
        return (
            <PageState
                loading={rentalQuery.isLoading}
                error={rentalQuery.error}
            >
                <div className="space-y-7 p-6 lg:p-10">
                    <div>
                        <p className="text-sm font-semibold text-[#00696b]">
                            My rental / properties
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">
                            Your rented property
                        </h1>
                    </div>
                    <EmptyRental />
                </div>
            </PageState>
        );
    }

    return (
        <PageState
            loading={rentalQuery.isLoading}
            error={rentalQuery.error}
        >
            <div className="space-y-7 p-6 lg:p-10">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">
                        My rental / properties
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">
                        Your Rented Property
                    </h1>
                </div>

                <RentalHero
                    rental={
                        rental as unknown as Parameters<
                            typeof RentalHero
                        >[0]["rental"]
                    }
                />

                {agreement?.status === "PENDING_TENANT" && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-[#ffe082] bg-[#fff8e1] p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-[#b78103]" />
                            <div>
                                <h3 className="font-bold text-[#5c4100]">
                                    Rental Agreement Action Required
                                </h3>
                                <p className="mt-0.5 text-sm text-[#785400]">
                                    Review the tenancy agreement and explicitly
                                    accept its terms before proceeding.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenAgreement}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                        >
                            <FileText className="h-4 w-4" />
                            Review & Accept Agreement
                        </button>
                    </div>
                )}

                {agreement?.status === "PENDING_OWNER" && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 h-6 w-6 shrink-0 text-blue-700" />
                            <div>
                                <h3 className="font-bold text-blue-900">
                                    Agreement Accepted — Awaiting Owner Approval
                                </h3>
                                <p className="mt-0.5 text-sm text-blue-800">
                                    You have accepted the agreement. The property owner must confirm it. Once confirmed, you will have 2 minutes to complete your advance payment.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {agreement?.status === "APPROVED_PENDING_PAYMENT" && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                        <RazorpayPayButton
                            bookingId={rental.bookingId}
                            type="ADVANCE"
                            label="Pay Advance"
                            agreement={agreement}
                        />
                    </div>
                )}

                {agreement?.status === "EXPIRED" && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
                        <h3 className="font-bold text-red-800">Rental Request Expired</h3>
                        <p className="mt-1 text-sm text-red-700">
                            This rental request has expired. Please submit a new rental request.
                        </p>
                        <Link
                            href={`/properties/${rental.property.id}`}
                            className="mt-3 inline-block text-sm font-semibold text-red-800 underline"
                        >
                            Submit a new rental request for this property →
                        </Link>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-[#191c1d]">
                            Lease & Individual Rent Share
                        </h2>

                        <dl className="mt-5 grid grid-cols-2 gap-5 text-sm">
                            <div>
                                <dt className="text-[#75777e]">Lease Start</dt>
                                <dd className="mt-1 font-bold">
                                    {date(rental.leaseStart)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">Lease End</dt>
                                <dd className="mt-1 font-bold">
                                    {date(rental.leaseEnd)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">
                                    Total Property Rent
                                </dt>
                                <dd className="mt-1 font-bold">
                                    {money(rental.monthlyRent)}/mo
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">
                                    Your Individual Rent Share
                                </dt>
                                <dd className="mt-1 font-extrabold text-[#00696b]">
                                    {money(
                                        myOccupant?.rentAmount ??
                                            rental.monthlyRent
                                    )}
                                    /mo
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">
                                    Your Deposit Share
                                </dt>
                                <dd className="mt-1 font-bold">
                                    {money(
                                        myOccupant?.securityDepositShare ??
                                            rental.securityDeposit
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">Split Mode</dt>
                                <dd className="mt-1 font-bold capitalize">
                                    {rental.splitMode.toLowerCase()} split
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">
                                    Tenancy Status
                                </dt>
                                <dd className="mt-1">
                                    <Status value={rental.status} />
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">
                                    Agreement Status
                                </dt>
                                <dd className="mt-1">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                            agreement?.status === "ACTIVE"
                                                ? "bg-[#d9f4f3] text-[#00696b]"
                                                : agreement?.status ===
                                                    "PENDING_OWNER"
                                                  ? "bg-[#dbeafe] text-[#1e4f91]"
                                                  : "bg-[#fff3cd] text-[#765b00]"
                                        }`}
                                    >
                                        {agreement?.status ?? "DRAFT"}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                        <h2 className="text-lg font-bold text-[#191c1d]">
                            Owner Information
                        </h2>

                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="text-[#75777e]">Owner Name</dt>
                                <dd className="mt-1 font-bold text-[#191c1d]">
                                    {rental.owner.name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#75777e]">Email</dt>
                                <dd className="mt-1 font-bold">
                                    <a
                                        className="text-[#00696b] hover:underline"
                                        href={`mailto:${rental.owner.email}`}
                                    >
                                        {rental.owner.email}
                                    </a>
                                </dd>
                            </div>

                            {rental.owner.phone && (
                                <div>
                                    <dt className="text-[#75777e]">Phone</dt>
                                    <dd className="mt-1 font-bold">
                                        <a
                                            className="text-[#00696b] hover:underline"
                                            href={`tel:${rental.owner.phone}`}
                                        >
                                            {rental.owner.phone}
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>
                </div>

                {occupants.length > 0 && (
                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#00696b]" />
                            <h2 className="text-lg font-bold text-[#191c1d]">
                                Co-Occupants & Rent Split
                            </h2>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#e1e3e4] text-[#75777e]">
                                        <th className="pb-3 font-semibold">Tenant</th>
                                        <th className="pb-3 font-semibold">Monthly Share</th>
                                        <th className="pb-3 font-semibold">Deposit Share</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#eef0f1]">
                                    {occupants.map((occupant) => (
                                        <tr key={occupant.id}>
                                            <td className="py-3 font-medium text-[#191c1d]">
                                                {occupant.tenant.name}{" "}
                                                {occupant.tenant.id ===
                                                myOccupant?.id
                                                    ? "(You)"
                                                    : ""}
                                                <span className="block text-xs text-[#75777e]">
                                                    {occupant.tenant.email}
                                                </span>
                                            </td>

                                            <td className="py-3 font-bold text-[#00696b]">
                                                {money(occupant.rentAmount)}
                                            </td>

                                            <td className="py-3 text-[#44474d]">
                                                {money(
                                                    occupant.securityDepositShare
                                                )}
                                            </td>

                                            <td className="py-3">
                                                <Status
                                                    value={occupant.status.toLowerCase()}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {agreement && (
                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#00696b]" />
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Your Tenancy Agreement
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-[#75777e]">
                                    Individual lease terms governing your
                                    occupancy.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleOpenAgreement}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#f0f4f5] px-4 py-2 text-sm font-semibold text-[#191c1d] transition hover:bg-[#e1e3e4]"
                            >
                                View Agreement Document
                            </button>
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-[#00696b]" />
                        <h2 className="text-lg font-bold text-[#191c1d]">
                            Individual Monthly Rent Payments
                        </h2>
                    </div>

                    {pendingMonthlyPayment && (
                        <div className="mt-5 rounded-xl border border-[#00696b]/20 bg-[#d9f4f3]/30 p-5">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#00696b]">
                                        Upcoming Due Rent
                                    </span>
                                    <p className="mt-1 text-2xl font-bold text-[#191c1d]">
                                        {money(pendingMonthlyPayment.amount)}
                                        <span className="text-sm font-normal text-[#75777e]">
                                            {" "}
                                            ({pendingMonthlyPayment.billingMonth})
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-[#75777e]">
                                        Due Date:{" "}
                                        {date(pendingMonthlyPayment.dueDate)}
                                    </p>
                                </div>

                                <RazorpayPayButton
                                    bookingId={rental.bookingId}
                                    type="MONTHLY_RENT"
                                    label={`Pay ₹${pendingMonthlyPayment.amount.toLocaleString("en-IN")}`}
                                    billingMonth={pendingMonthlyPayment.billingMonth}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-[#191c1d]">
                            Payment History
                        </h3>

                        {payments.length === 0 ? (
                            <p className="mt-2 text-sm text-[#75777e]">
                                No payment records found yet.
                            </p>
                        ) : (
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e1e3e4] text-[#75777e]">
                                            <th className="pb-3 font-semibold">Type</th>
                                            <th className="pb-3 font-semibold">Cycle / Month</th>
                                            <th className="pb-3 font-semibold">Amount</th>
                                            <th className="pb-3 font-semibold">Due Date</th>
                                            <th className="pb-3 font-semibold">Paid Date</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#eef0f1]">
                                        {payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="py-3 font-semibold uppercase text-[#191c1d]">
                                                    {payment.type}
                                                </td>
                                                <td className="py-3 text-[#44474d]">
                                                    {payment.billingMonth ?? "Advance"}
                                                </td>
                                                <td className="py-3 font-bold text-[#00696b]">
                                                    {money(payment.amount)}
                                                </td>
                                                <td className="py-3 text-[#75777e]">
                                                    {date(payment.dueDate)}
                                                </td>
                                                <td className="py-3 text-[#75777e]">
                                                    {date(payment.paidAt)}
                                                </td>
                                                <td className="py-3">
                                                    <Status value={payment.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {isAgreementModalOpen && agreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rental-agreement-title"
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
                    >
                        <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
                            <h2
                                id="rental-agreement-title"
                                className="text-xl font-bold text-[#191c1d]"
                            >
                                Individual Tenancy Agreement
                            </h2>

                            <button
                                type="button"
                                onClick={handleCloseAgreement}
                                disabled={acceptMutation.isPending}
                                aria-label="Close agreement"
                                className="text-[#75777e] hover:text-[#191c1d] disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        {acceptError && (
                            <div
                                role="alert"
                                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                            >
                                {acceptError}
                            </div>
                        )}

                        <div className="mt-6 space-y-4 text-sm text-[#44474d]">
                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f8f9fa] p-4">
                                <div>
                                    <span className="text-xs text-[#75777e]">
                                        Tenant
                                    </span>
                                    <p className="font-bold text-[#191c1d]">You</p>
                                </div>

                                <div>
                                    <span className="text-xs text-[#75777e]">
                                        Owner
                                    </span>
                                    <p className="font-bold text-[#191c1d]">
                                        {rental.owner.name}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-[#75777e]">
                                        Monthly Share
                                    </span>
                                    <p className="font-bold text-[#00696b]">
                                        {money(agreement.monthlyRent)}/mo
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs text-[#75777e]">
                                        Lease Period
                                    </span>
                                    <p className="font-bold text-[#191c1d]">
                                        {date(agreement.leaseStart)} –{" "}
                                        {date(agreement.leaseEnd)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#191c1d]">
                                    Agreement Status
                                </h4>
                                <p className="mt-1">
                                    Current state:{" "}
                                    <span className="font-bold uppercase text-[#00696b]">
                                        {agreement.status}
                                    </span>

                                    {agreement.tenantAcceptedAt && (
                                        <span className="ml-2 text-xs text-green-700">
                                            (Accepted on{" "}
                                            {date(agreement.tenantAcceptedAt)})
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#191c1d]">
                                    Terms & Conditions
                                </h4>
                                <div className="mt-2 whitespace-pre-wrap rounded-xl border border-[#e1e3e4] bg-[#fdfdfd] p-4 font-mono text-xs leading-relaxed text-[#333]">
                                    {agreement.terms}
                                </div>
                            </div>

                            {agreement.status === "PENDING_TENANT" && (
                                <div className="rounded-xl border border-[#e1e3e4] p-4">
                                    <label className="flex cursor-pointer items-start gap-3 text-sm text-[#191c1d]">
                                        <input
                                            type="checkbox"
                                            checked={hasAcceptedTerms}
                                            onChange={(event) => {
                                                setHasAcceptedTerms(
                                                    event.target.checked
                                                );
                                                setAcceptError(null);
                                            }}
                                            className="mt-1 h-4 w-4 accent-[#00696b]"
                                        />
                                        <span>
                                            I have read and understood the
                                            rental agreement and agree to its
                                            terms and conditions.
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-[#e1e3e4] pt-4">
                            <button
                                type="button"
                                onClick={handleCloseAgreement}
                                disabled={acceptMutation.isPending}
                                className="rounded-xl border border-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#191c1d] hover:bg-gray-50 disabled:opacity-50"
                            >
                                Close
                            </button>

                            {agreement.status === "PENDING_TENANT" && (
                                <button
                                    type="button"
                                    onClick={handleAcceptAgreement}
                                    disabled={
                                        acceptMutation.isPending ||
                                        !hasAcceptedTerms
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {acceptMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Accept Agreement
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PageState>
    );
}
