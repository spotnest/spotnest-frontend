"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Edit3,
    Eye,
    FileText,
    History,
    Loader2,
    Mail,
    Plus,
    RefreshCw,
    Send,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";

import {
    useConfirmAgreement,
    useDeleteOrCancelAgreement,
    useOwnerAgreements,
    useOwnerRentals,
    useResendAgreement,
    useSetRentSplit,
    useTerminateRental,
    useUpdateAgreement,
} from "@/src/modules/rentals/hooks/useRentals";
import type { OwnerAgreementItem, OwnerRentalItem } from "@/src/modules/rentals/services/rentalService";

export default function OwnerRentalsPage() {
    const rentalsQuery = useOwnerRentals();
    const agreementsQuery = useOwnerAgreements();

    const confirmMutation = useConfirmAgreement();
    const setSplitMutation = useSetRentSplit();
    const terminateMutation = useTerminateRental();
    const updateAgreementMutation = useUpdateAgreement();
    const deleteAgreementMutation = useDeleteOrCancelAgreement();
    const resendAgreementMutation = useResendAgreement();

    // Tab state
    const [activeTab, setActiveTab] = useState<"rentals" | "agreements">("rentals");
    const [agreementStatusFilter, setAgreementStatusFilter] = useState<string>("ALL");

    // Rent split modal state
    const [selectedRental, setSelectedRental] = useState<OwnerRentalItem | null>(null);
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
    const [splitMode, setSplitMode] = useState<"EQUAL" | "CUSTOM">("EQUAL");
    const [occupantInputs, setOccupantInputs] = useState<
        Array<{ tenantEmail: string; rentAmount: number; securityDepositShare: number }>
    >([]);
    const [splitError, setSplitError] = useState<string | null>(null);

    // Rental termination state
    const [rentalToTerminate, setRentalToTerminate] = useState<OwnerRentalItem | null>(null);

    // Agreement management modals
    const [viewAgreement, setViewAgreement] = useState<OwnerAgreementItem | null>(null);
    const [editAgreement, setEditAgreement] = useState<OwnerAgreementItem | null>(null);
    const [agreementToDelete, setAgreementToDelete] = useState<OwnerAgreementItem | null>(null);
    const [resendSuccessId, setResendSuccessId] = useState<string | null>(null);

    // Edit agreement form state
    const [editMonthlyRent, setEditMonthlyRent] = useState<number>(0);
    const [editSecurityDeposit, setEditSecurityDeposit] = useState<number>(0);
    const [editMaintenanceFee, setEditMaintenanceFee] = useState<number>(0);
    const [editNoticePeriod, setEditNoticePeriod] = useState<number>(30);
    const [editLeaseStart, setEditLeaseStart] = useState<string>("");
    const [editLeaseEnd, setEditLeaseEnd] = useState<string>("");
    const [editTerms, setEditTerms] = useState<string>("");
    const [editRevisionNote, setEditRevisionNote] = useState<string>("");
    const [editError, setEditError] = useState<string | null>(null);

    const rentals = rentalsQuery.data ?? [];
    const agreements = agreementsQuery.data ?? [];

    const filteredAgreements = useMemo(() => {
        if (agreementStatusFilter === "ALL") return agreements;
        return agreements.filter((a) => a.status === agreementStatusFilter);
    }, [agreements, agreementStatusFilter]);

    // Split Modal Handlers
    const handleOpenSplitModal = (rental: OwnerRentalItem) => {
        setSelectedRental(rental);
        setSplitMode(rental.splitMode ?? "EQUAL");
        setSplitError(null);

        if (rental.occupants && rental.occupants.length > 0) {
            setOccupantInputs(
                rental.occupants.map((occ) => ({
                    tenantEmail: occ.tenant.email,
                    rentAmount: occ.rentAmount,
                    securityDepositShare: occ.securityDepositShare,
                }))
            );
        } else {
            setOccupantInputs([
                { tenantEmail: "", rentAmount: rental.monthlyRent, securityDepositShare: rental.securityDeposit },
            ]);
        }
        setIsSplitModalOpen(true);
    };

    const handleAddOccupantInput = () => {
        setOccupantInputs((prev) => [...prev, { tenantEmail: "", rentAmount: 0, securityDepositShare: 0 }]);
    };

    const handleRemoveOccupantInput = (index: number) => {
        setOccupantInputs((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOccupantChange = (
        index: number,
        field: "tenantEmail" | "rentAmount" | "securityDepositShare",
        value: string | number
    ) => {
        setOccupantInputs((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const calculateCurrentSum = () => {
        if (!selectedRental) return 0;
        if (splitMode === "EQUAL") return selectedRental.monthlyRent;
        return occupantInputs.reduce((sum, item) => sum + (Number(item.rentAmount) || 0), 0);
    };

    const handleSaveSplit = async () => {
        if (!selectedRental) return;
        setSplitError(null);

        const currentSum = calculateCurrentSum();
        const expectedTotal = selectedRental.monthlyRent;

        if (Math.abs(currentSum - expectedTotal) > 0.01) {
            setSplitError(
                `Rent split error: Sum of shares (₹${currentSum.toLocaleString(
                    "en-IN"
                )}) must equal total rent (₹${expectedTotal.toLocaleString("en-IN")})`
            );
            return;
        }

        try {
            await setSplitMutation.mutateAsync({
                rentalId: selectedRental.id,
                payload: {
                    splitMode,
                    occupants: occupantInputs.map((occ) => ({
                        tenantEmail: occ.tenantEmail.trim(),
                        rentAmount: Number(occ.rentAmount),
                        securityDepositShare: Number(occ.securityDepositShare),
                    })),
                },
            });
            setIsSplitModalOpen(false);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                (err as Error)?.message ||
                "Failed to update rent split.";
            setSplitError(message);
        }
    };

    const handleConfirmAgreement = async (agreementId: string) => {
        try {
            await confirmMutation.mutateAsync(agreementId);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                "Failed to confirm agreement";
            alert(message);
        }
    };

    const handleConfirmTerminate = async () => {
        if (!rentalToTerminate) return;
        try {
            await terminateMutation.mutateAsync({ rentalId: rentalToTerminate.id });
            setRentalToTerminate(null);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                "Failed to terminate rental";
            alert(message);
        }
    };

    // Agreement Edit Handlers
    const handleOpenEditAgreement = (agreement: OwnerAgreementItem) => {
        setEditAgreement(agreement);
        setEditMonthlyRent(agreement.monthlyRent);
        setEditSecurityDeposit(agreement.securityDepositShare);
        setEditMaintenanceFee(agreement.maintenanceFee ?? 0);
        setEditNoticePeriod(agreement.noticePeriodDays ?? 30);
        setEditLeaseStart(agreement.leaseStart ? agreement.leaseStart.split("T")[0]! : "");
        setEditLeaseEnd(agreement.leaseEnd ? agreement.leaseEnd.split("T")[0]! : "");
        setEditTerms(agreement.terms);
        setEditRevisionNote("");
        setEditError(null);
    };

    const handleSaveAgreementEdit = async () => {
        if (!editAgreement) return;
        setEditError(null);

        if (editMonthlyRent <= 0) {
            setEditError("Monthly rent must be greater than 0");
            return;
        }

        if (editSecurityDeposit < 0) {
            setEditError("Security deposit cannot be negative");
            return;
        }

        if (editTerms.trim().length < 20) {
            setEditError("Agreement terms must be at least 20 characters");
            return;
        }

        try {
            await updateAgreementMutation.mutateAsync({
                agreementId: editAgreement._id,
                payload: {
                    monthlyRent: editMonthlyRent,
                    securityDepositShare: editSecurityDeposit,
                    maintenanceFee: editMaintenanceFee,
                    noticePeriodDays: editNoticePeriod,
                    leaseStart: editLeaseStart,
                    leaseEnd: editLeaseEnd,
                    terms: editTerms.trim(),
                    revisionNote: editRevisionNote.trim() || undefined,
                },
            });
            setEditAgreement(null);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                (err as Error)?.message ||
                "Failed to update agreement.";
            setEditError(message);
        }
    };

    const handleDeleteOrCancelAgreement = async () => {
        if (!agreementToDelete) return;
        try {
            await deleteAgreementMutation.mutateAsync(agreementToDelete._id);
            setAgreementToDelete(null);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                "Failed to delete/cancel agreement";
            alert(message);
        }
    };

    const handleResendNotification = async (agreementId: string) => {
        try {
            await resendAgreementMutation.mutateAsync(agreementId);
            setResendSuccessId(agreementId);
            setTimeout(() => setResendSuccessId(null), 3000);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                "Failed to resend agreement notification";
            alert(message);
        }
    };

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-3">
                <Link
                    href="/owner/dashboard"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#00696b] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#00696b]">Owner Portal</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#191c1d]">Rental Management</h1>
                    <p className="mt-1 text-base text-[#44474d]">
                        Manage property tenancies, shared occupant rent splits, rental agreements, and monthly rent statuses.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/owner/rentals/manual"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#004f51]"
                    >
                        <Plus className="h-4 w-4" /> Create Manual Rental Agreement
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 flex border-b border-[#e1e3e4]">
                <button
                    type="button"
                    onClick={() => setActiveTab("rentals")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                        activeTab === "rentals"
                            ? "border-[#00696b] text-[#00696b]"
                            : "border-transparent text-[#75777e] hover:text-[#191c1d]"
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Active Tenancies & Rent Splits
                    <span className="rounded-full bg-[#f0f2f3] px-2 py-0.5 text-xs font-bold text-[#44474d]">
                        {rentals.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("agreements")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                        activeTab === "agreements"
                            ? "border-[#00696b] text-[#00696b]"
                            : "border-transparent text-[#75777e] hover:text-[#191c1d]"
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Rental Agreements
                    <span className="rounded-full bg-[#f0f2f3] px-2 py-0.5 text-xs font-bold text-[#44474d]">
                        {agreements.length}
                    </span>
                </button>
            </div>

            {/* TAB 1: ACTIVE TENANCIES */}
            {activeTab === "rentals" && (
                <>
                    {rentalsQuery.isLoading ? (
                        <div className="mt-10 flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#00696b]" />
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-10 text-center">
                            <h3 className="text-lg font-bold text-[#191c1d]">No active property rentals</h3>
                            <p className="mt-1 text-sm text-[#75777e]">
                                When tenants make advance payments for approved booking requests or manual agreements,
                                their rentals will appear here.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/owner/rentals/manual"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-4 py-2 text-sm font-bold text-white hover:bg-[#004f51]"
                                >
                                    <Plus className="h-4 w-4" /> Draft Manual Agreement
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-8">
                            {rentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs"
                                >
                                    {/* Property Header */}
                                    <div className="flex flex-col justify-between gap-4 border-b border-[#e1e3e4] pb-5 sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#191c1d]">{rental.property.title}</h2>
                                            <p className="mt-0.5 text-xs text-[#75777e]">
                                                {rental.property.address.city}, {rental.property.address.state}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-extrabold text-[#00696b]">
                                                ₹{rental.monthlyRent.toLocaleString("en-IN")}/mo
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                                    rental.status === "active"
                                                        ? "bg-[#d9f4f3] text-[#00696b]"
                                                        : "bg-[#fff0dc] text-[#95611d]"
                                                }`}
                                            >
                                                {rental.status}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenSplitModal(rental)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#00696b] bg-[#d9f4f3]/40 px-3.5 py-2 text-xs font-bold text-[#00696b] hover:bg-[#d9f4f3]"
                                            >
                                                <Users className="h-4 w-4" /> Manage Occupants & Split
                                            </button>
                                        </div>
                                    </div>

                                    {/* Occupants & Rent Split Table */}
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-[#191c1d]">
                                                Tenants / Occupants ({rental.occupants.length}) — Split Mode:{" "}
                                                <span className="font-extrabold capitalize text-[#00696b]">
                                                    {rental.splitMode.toLowerCase()}
                                                </span>
                                            </h3>
                                        </div>

                                        {rental.occupants.length === 0 ? (
                                            <p className="mt-2 text-sm text-[#75777e]">No occupant records found.</p>
                                        ) : (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-[#e1e3e4] text-[#75777e]">
                                                            <th className="pb-3 font-semibold">Tenant</th>
                                                            <th className="pb-3 font-semibold">Monthly Share</th>
                                                            <th className="pb-3 font-semibold">Deposit Share</th>
                                                            <th className="pb-3 font-semibold">Agreement Status</th>
                                                            <th className="pb-3 font-semibold">Latest Rent Status</th>
                                                            <th className="pb-3 font-semibold">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#eef0f1]">
                                                        {rental.occupants.map((occ) => (
                                                            <tr key={occ.id}>
                                                                <td className="py-3 font-medium text-[#191c1d]">
                                                                    {occ.tenant.name}
                                                                    <span className="block text-xs text-[#75777e]">
                                                                        {occ.tenant.email}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 font-bold text-[#00696b]">
                                                                    ₹{occ.rentAmount.toLocaleString("en-IN")}
                                                                </td>
                                                                <td className="py-3 text-[#44474d]">
                                                                    ₹{occ.securityDepositShare.toLocaleString("en-IN")}
                                                                </td>
                                                                <td className="py-3">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                            occ.agreementStatus === "ACTIVE"
                                                                                ? "bg-[#d9f4f3] text-[#00696b]"
                                                                                : occ.agreementStatus === "APPROVED_PENDING_PAYMENT"
                                                                                  ? "bg-[#e0f2fe] text-[#0369a1]"
                                                                                  : occ.agreementStatus === "PENDING_OWNER"
                                                                                    ? "bg-[#dbeafe] text-[#1e4f91]"
                                                                                    : occ.agreementStatus === "EXPIRED"
                                                                                      ? "bg-[#fee2e2] text-[#991b1b]"
                                                                                      : "bg-[#fff3cd] text-[#765b00]"
                                                                        }`}
                                                                    >
                                                                        {occ.agreementStatus}
                                                                    </span>
                                                                    {occ.agreementStatus === "APPROVED_PENDING_PAYMENT" &&
                                                                        occ.paymentDeadline && (
                                                                            <span className="mt-1 block text-[11px] font-medium text-amber-700">
                                                                                Deadline:{" "}
                                                                                {new Date(occ.paymentDeadline).toLocaleTimeString(
                                                                                    [],
                                                                                    {
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                        second: "2-digit",
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                </td>
                                                                <td className="py-3">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                            occ.monthlyPaymentStatus === "PAID"
                                                                                ? "bg-[#d9f4f3] text-[#00696b]"
                                                                                : occ.monthlyPaymentStatus === "OVERDUE"
                                                                                  ? "bg-[#ffdad6] text-[#ba1a1a]"
                                                                                  : "bg-[#fff3cd] text-[#765b00]"
                                                                        }`}
                                                                    >
                                                                        {occ.monthlyPaymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3">
                                                                    {occ.agreementStatus === "PENDING_OWNER" &&
                                                                        occ.agreementId && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleConfirmAgreement(occ.agreementId!)
                                                                                }
                                                                                disabled={confirmMutation.isPending}
                                                                                className="inline-flex items-center gap-1 rounded-lg bg-[#00696b] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#004f51] disabled:opacity-50"
                                                                            >
                                                                                <CheckCircle className="h-3.5 w-3.5" /> Confirm Agreement
                                                                            </button>
                                                                        )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Termination option */}
                                    {rental.status !== "ended" && (
                                        <div className="mt-6 flex justify-end border-t border-[#e1e3e4] pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setRentalToTerminate(rental)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800"
                                            >
                                                <XCircle className="h-4 w-4" /> Terminate Rental Lease
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* TAB 2: RENTAL AGREEMENT MANAGEMENT */}
            {activeTab === "agreements" && (
                <div className="mt-6 space-y-6">
                    {/* Status filter bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {["ALL", "PENDING_TENANT", "PENDING_OWNER", "APPROVED_PENDING_PAYMENT", "ACTIVE", "CANCELLED", "EXPIRED"].map(
                                (st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setAgreementStatusFilter(st)}
                                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                            agreementStatusFilter === st
                                                ? "bg-[#00696b] text-white"
                                                : "bg-white text-[#44474d] border border-[#e1e3e4] hover:bg-slate-50"
                                        }`}
                                    >
                                        {st === "ALL" ? "All Agreements" : st.replace(/_/g, " ")}
                                    </button>
                                )
                            )}
                        </div>

                        <span className="text-xs font-medium text-[#75777e]">
                            Showing {filteredAgreements.length} of {agreements.length} agreements
                        </span>
                    </div>

                    {agreementsQuery.isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#00696b]" />
                        </div>
                    ) : filteredAgreements.length === 0 ? (
                        <div className="rounded-2xl border border-[#e1e3e4] bg-white p-10 text-center">
                            <FileText className="mx-auto h-10 w-10 text-[#75777e]" />
                            <h3 className="mt-3 text-lg font-bold text-[#191c1d]">No rental agreements found</h3>
                            <p className="mt-1 text-sm text-[#75777e]">
                                {agreementStatusFilter === "ALL"
                                    ? "Create a manual agreement or approve incoming booking requests to generate agreements."
                                    : `No agreements matching status "${agreementStatusFilter}".`}
                            </p>
                            <div className="mt-5">
                                <Link
                                    href="/owner/rentals/manual"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-4 py-2 text-sm font-bold text-white hover:bg-[#004f51]"
                                >
                                    <Plus className="h-4 w-4" /> Create Manual Agreement
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-[#e1e3e4] bg-white shadow-xs">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                        <th className="py-4 px-5">Property & Tenant</th>
                                        <th className="py-4 px-4">Rent / Deposit</th>
                                        <th className="py-4 px-4">Lease Term</th>
                                        <th className="py-4 px-4">Status & Version</th>
                                        <th className="py-4 px-4">Delivery</th>
                                        <th className="py-4 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eef0f1]">
                                    {filteredAgreements.map((agr) => {
                                        const isUnsignedDraft =
                                            !agr.tenantAcceptedAt && agr.status === "PENDING_TENANT";
                                        const isActiveAgreement = agr.status === "ACTIVE";

                                        return (
                                            <tr key={agr._id} className="hover:bg-slate-50/50">
                                                <td className="py-4 px-5">
                                                    <div className="font-bold text-[#191c1d]">{agr.property.title}</div>
                                                    <div className="text-xs text-[#75777e]">
                                                        {agr.property.address?.city}, {agr.property.address?.state}
                                                    </div>
                                                    <div className="mt-1 text-xs text-[#44474d]">
                                                        <span className="font-semibold text-[#191c1d]">Tenant:</span>{" "}
                                                        {agr.tenant.name} ({agr.tenant.email})
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-extrabold text-[#00696b]">
                                                        ₹{agr.monthlyRent.toLocaleString("en-IN")}/mo
                                                    </div>
                                                    <div className="text-xs text-[#44474d]">
                                                        Deposit: ₹{agr.securityDepositShare.toLocaleString("en-IN")}
                                                    </div>
                                                    {agr.maintenanceFee ? (
                                                        <div className="text-[11px] text-[#75777e]">
                                                            Maint: ₹{agr.maintenanceFee.toLocaleString("en-IN")}
                                                        </div>
                                                    ) : null}
                                                </td>

                                                <td className="py-4 px-4 text-xs text-[#44474d]">
                                                    <div>
                                                        <span className="font-medium text-[#191c1d]">Start:</span>{" "}
                                                        {new Date(agr.leaseStart).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-[#191c1d]">End:</span>{" "}
                                                        {new Date(agr.leaseEnd).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[11px] text-[#75777e]">
                                                        Notice: {agr.noticePeriodDays ?? 30} days
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            agr.status === "ACTIVE"
                                                                ? "bg-[#d9f4f3] text-[#00696b]"
                                                                : agr.status === "APPROVED_PENDING_PAYMENT"
                                                                  ? "bg-[#e0f2fe] text-[#0369a1]"
                                                                  : agr.status === "PENDING_OWNER"
                                                                    ? "bg-[#dbeafe] text-[#1e4f91]"
                                                                    : agr.status === "CANCELLED"
                                                                      ? "bg-slate-100 text-slate-600"
                                                                      : agr.status === "EXPIRED"
                                                                        ? "bg-[#fee2e2] text-[#991b1b]"
                                                                        : "bg-[#fff3cd] text-[#765b00]"
                                                        }`}
                                                    >
                                                        {agr.status.replace(/_/g, " ")}
                                                    </span>

                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#75777e]">
                                                        <span className="font-semibold text-[#191c1d]">
                                                            v{agr.version ?? 1}
                                                        </span>
                                                        {agr.history && agr.history.length > 0 && (
                                                            <span className="text-[10px] text-amber-700">
                                                                ({agr.history.length} revision{agr.history.length > 1 ? "s" : ""})
                                                            </span>
                                                        )}
                                                    </div>

                                                    {agr.status === "APPROVED_PENDING_PAYMENT" && agr.paymentDeadline && (
                                                        <div className="mt-0.5 text-[10px] font-medium text-amber-700">
                                                            Due: {new Date(agr.paymentDeadline).toLocaleDateString()}{" "}
                                                            {new Date(agr.paymentDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-xs">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
                                                            agr.deliveryStatus === "DELIVERED"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : agr.deliveryStatus === "FAILED"
                                                                  ? "bg-red-50 text-red-700"
                                                                  : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {agr.deliveryStatus === "DELIVERED" ? (
                                                            <CheckCircle className="h-3 w-3" />
                                                        ) : agr.deliveryStatus === "FAILED" ? (
                                                            <AlertTriangle className="h-3 w-3" />
                                                        ) : (
                                                            <Clock className="h-3 w-3" />
                                                        )}
                                                        {agr.deliveryStatus ?? "PENDING"}
                                                    </span>
                                                    {resendSuccessId === agr._id && (
                                                        <div className="mt-1 text-[11px] font-semibold text-emerald-600">
                                                            Notification Sent!
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-4 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewAgreement(agr)}
                                                            title="View Agreement Terms"
                                                            className="rounded-lg p-1.5 text-[#44474d] hover:bg-[#f0f2f3] hover:text-[#191c1d]"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {/* Confirm if PENDING_OWNER */}
                                                        {agr.status === "PENDING_OWNER" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleConfirmAgreement(agr._id)}
                                                                disabled={confirmMutation.isPending}
                                                                title="Confirm Agreement"
                                                                className="rounded-lg bg-[#00696b] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#004f51] disabled:opacity-50"
                                                            >
                                                                Confirm
                                                            </button>
                                                        )}

                                                        {/* Edit Draft / Revise */}
                                                        {!isActiveAgreement && agr.status !== "CANCELLED" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditAgreement(agr)}
                                                                title="Edit / Revise Agreement"
                                                                className="rounded-lg p-1.5 text-[#00696b] hover:bg-[#d9f4f3]/40"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {/* Resend Notification */}
                                                        {(agr.status === "PENDING_TENANT" ||
                                                            agr.status === "PENDING_OWNER" ||
                                                            agr.deliveryStatus === "FAILED") && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleResendNotification(agr._id)}
                                                                disabled={resendAgreementMutation.isPending}
                                                                title="Resend Email Notification"
                                                                className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                                            >
                                                                <Mail className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {/* Delete Draft / Soft-Cancel */}
                                                        {agr.status !== "CANCELLED" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAgreementToDelete(agr)}
                                                                title={
                                                                    isUnsignedDraft
                                                                        ? "Delete Draft"
                                                                        : "Cancel Agreement"
                                                                }
                                                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: VIEW AGREEMENT DETAILS */}
            {viewAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#00696b]">
                                    Agreement Inspection
                                </span>
                                <h2 className="text-xl font-bold text-[#191c1d]">
                                    {viewAgreement.property.title} (v{viewAgreement.version ?? 1})
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewAgreement(null)}
                                className="rounded-lg p-1 text-[#75777e] hover:bg-slate-100 hover:text-[#191c1d]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-6 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-3 text-xs">
                                    <div className="font-semibold text-[#75777e]">Status</div>
                                    <div className="mt-1 font-bold text-[#00696b]">
                                        {viewAgreement.status.replace(/_/g, " ")}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-3 text-xs">
                                    <div className="font-semibold text-[#75777e]">Monthly Rent</div>
                                    <div className="mt-1 font-bold text-[#191c1d]">
                                        ₹{viewAgreement.monthlyRent.toLocaleString("en-IN")}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-3 text-xs">
                                    <div className="font-semibold text-[#75777e]">Security Deposit</div>
                                    <div className="mt-1 font-bold text-[#191c1d]">
                                        ₹{viewAgreement.securityDepositShare.toLocaleString("en-IN")}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-3 text-xs">
                                    <div className="font-semibold text-[#75777e]">Notice Period</div>
                                    <div className="mt-1 font-bold text-[#191c1d]">
                                        {viewAgreement.noticePeriodDays ?? 30} days
                                    </div>
                                </div>
                            </div>

                            {/* Tenant & Timeline info */}
                            <div className="rounded-xl border border-[#e1e3e4] p-4 text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[#75777e]">Tenant:</span>
                                    <span className="font-bold text-[#191c1d]">
                                        {viewAgreement.tenant.name} ({viewAgreement.tenant.email})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#75777e]">Lease Duration:</span>
                                    <span className="font-bold text-[#191c1d]">
                                        {new Date(viewAgreement.leaseStart).toLocaleDateString()} —{" "}
                                        {new Date(viewAgreement.leaseEnd).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#75777e]">Delivery Status:</span>
                                    <span className="font-bold text-[#191c1d]">
                                        {viewAgreement.deliveryStatus ?? "PENDING"}{" "}
                                        {viewAgreement.deliveryError ? `(${viewAgreement.deliveryError})` : ""}
                                    </span>
                                </div>
                                {viewAgreement.tenantAcceptedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-[#75777e]">Tenant Accepted:</span>
                                        <span className="font-bold text-emerald-700">
                                            {new Date(viewAgreement.tenantAcceptedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {viewAgreement.ownerAcceptedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-[#75777e]">Owner Confirmed:</span>
                                        <span className="font-bold text-emerald-700">
                                            {new Date(viewAgreement.ownerAcceptedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Full Agreement Terms */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                    Legally Binding Agreement Terms (Snapshot)
                                </h3>
                                <pre className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-4 font-mono text-xs leading-relaxed text-[#191c1d]">
                                    {viewAgreement.terms}
                                </pre>
                            </div>

                            {/* History Revisions if any */}
                            {viewAgreement.history && viewAgreement.history.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                        <History className="h-3.5 w-3.5" /> Revision Audit History
                                    </h3>
                                    <div className="mt-2 space-y-2">
                                        {viewAgreement.history.map((hist, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-lg border border-[#e1e3e4] bg-slate-50 p-3 text-xs"
                                            >
                                                <div className="flex justify-between font-bold text-[#191c1d]">
                                                    <span>Version {hist.version}</span>
                                                    <span className="text-[#75777e]">
                                                        {new Date(hist.modifiedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-[#44474d]">
                                                    Rent: ₹{hist.monthlyRent.toLocaleString("en-IN")} | Deposit: ₹
                                                    {hist.securityDepositShare.toLocaleString("en-IN")}
                                                </div>
                                                {hist.note && (
                                                    <div className="mt-1 text-slate-600 italic">Note: {hist.note}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end border-t border-[#e1e3e4] pt-4">
                            <button
                                type="button"
                                onClick={() => setViewAgreement(null)}
                                className="rounded-xl border border-[#e1e3e4] px-5 py-2 text-sm font-semibold text-[#191c1d]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT DRAFT / REVISE AGREEMENT */}
            {editAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#191c1d]">Edit / Revise Agreement</h2>
                                <p className="text-xs text-[#75777e]">{editAgreement.property.title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditAgreement(null)}
                                className="rounded-lg p-1 text-[#75777e] hover:bg-slate-100 hover:text-[#191c1d]"
                            >
                                ✕
                            </button>
                        </div>

                        {editError && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                <span>{editError}</span>
                            </div>
                        )}

                        {editAgreement.tenantAcceptedAt && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                <div className="font-bold">Notice: Tenant Re-acceptance Required</div>
                                <p className="mt-0.5">
                                    The tenant has previously accepted Version {editAgreement.version ?? 1}. Saving modifications
                                    will create Version {(editAgreement.version ?? 1) + 1}, archive the current version to audit history,
                                    and reset status to PENDING_TENANT requiring new tenant acceptance.
                                </p>
                            </div>
                        )}

                        <div className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Monthly Rent (₹)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editMonthlyRent}
                                        onChange={(e) => setEditMonthlyRent(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm font-bold focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Security Deposit (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editSecurityDeposit}
                                        onChange={(e) => setEditSecurityDeposit(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm font-bold focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Maintenance Fee (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editMaintenanceFee}
                                        onChange={(e) => setEditMaintenanceFee(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Notice Period (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editNoticePeriod}
                                        onChange={(e) => setEditNoticePeriod(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Lease End</label>
                                    <input
                                        type="date"
                                        value={editLeaseEnd}
                                        onChange={(e) => setEditLeaseEnd(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[#75777e]">Agreement Terms & Clauses</label>
                                <textarea
                                    rows={8}
                                    value={editTerms}
                                    onChange={(e) => setEditTerms(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-[#e1e3e4] p-3 font-mono text-xs focus:border-[#00696b] focus:outline-hidden"
                                />
                            </div>

                            {editAgreement.tenantAcceptedAt && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Revision Note (Reason for Change)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Adjusted rent as agreed in phone call"
                                        value={editRevisionNote}
                                        onChange={(e) => setEditRevisionNote(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#e1e3e4] px-3.5 py-2 text-sm focus:border-[#00696b] focus:outline-hidden"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-[#e1e3e4] pt-4">
                            <button
                                type="button"
                                onClick={() => setEditAgreement(null)}
                                className="rounded-xl border border-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#191c1d]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAgreementEdit}
                                disabled={updateAgreementMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#004f51] disabled:opacity-50"
                            >
                                {updateAgreementMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: DELETE DRAFT / SOFT-CANCEL AGREEMENT */}
            {agreementToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-[#191c1d]">
                            {!agreementToDelete.tenantAcceptedAt && agreementToDelete.status === "PENDING_TENANT"
                                ? "Delete Draft Agreement"
                                : "Cancel Rental Agreement"}
                        </h2>
                        <p className="mt-2 text-sm text-[#75777e]">
                            {!agreementToDelete.tenantAcceptedAt && agreementToDelete.status === "PENDING_TENANT"
                                ? `Are you sure you want to permanently delete this draft agreement for ${agreementToDelete.property.title}?`
                                : `This agreement has already been accepted or confirmed. Soft-cancelling will mark it as CANCELLED and preserve audit records.`}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreementToDelete(null)}
                                className="rounded-xl border border-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#191c1d]"
                            >
                                Nevermind
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteOrCancelAgreement}
                                disabled={deleteAgreementMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteAgreementMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : !agreementToDelete.tenantAcceptedAt && agreementToDelete.status === "PENDING_TENANT" ? (
                                    "Delete Permanently"
                                ) : (
                                    "Confirm Cancellation"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Rent Split Modal (Existing) */}
            {isSplitModalOpen && selectedRental && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
                            <h2 className="text-xl font-bold text-[#191c1d]">Configure Rent Split</h2>
                            <button
                                type="button"
                                onClick={() => setIsSplitModalOpen(false)}
                                className="text-[#75777e] hover:text-[#191c1d]"
                            >
                                ✕
                            </button>
                        </div>

                        {splitError && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                <span>{splitError}</span>
                            </div>
                        )}

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-[#75777e]">Total Monthly Rent</label>
                                <p className="mt-1 text-2xl font-extrabold text-[#00696b]">
                                    ₹{selectedRental.monthlyRent.toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[#75777e]">Split Mode</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="radio"
                                            name="splitMode"
                                            value="EQUAL"
                                            checked={splitMode === "EQUAL"}
                                            onChange={() => setSplitMode("EQUAL")}
                                            className="text-[#00696b]"
                                        />
                                        Equal Split
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="radio"
                                            name="splitMode"
                                            value="CUSTOM"
                                            checked={splitMode === "CUSTOM"}
                                            onChange={() => setSplitMode("CUSTOM")}
                                            className="text-[#00696b]"
                                        />
                                        Custom Split
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase text-[#75777e]">Occupants</label>
                                    <button
                                        type="button"
                                        onClick={handleAddOccupantInput}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#00696b] hover:underline"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Co-Occupant
                                    </button>
                                </div>

                                {occupantInputs.map((input, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col gap-2 rounded-xl border border-[#e1e3e4] p-3 sm:flex-row sm:items-center"
                                    >
                                        <div className="flex-1">
                                            <input
                                                type="email"
                                                placeholder="Tenant Email"
                                                value={input.tenantEmail}
                                                onChange={(e) => handleOccupantChange(idx, "tenantEmail", e.target.value)}
                                                className="w-full rounded-lg border border-[#e1e3e4] px-3 py-1.5 text-sm focus:border-[#00696b] focus:outline-hidden"
                                            />
                                        </div>

                                        {splitMode === "CUSTOM" && (
                                            <div className="w-32">
                                                <input
                                                    type="number"
                                                    placeholder="Rent Share (₹)"
                                                    value={input.rentAmount || ""}
                                                    onChange={(e) =>
                                                        handleOccupantChange(idx, "rentAmount", Number(e.target.value))
                                                    }
                                                    className="w-full rounded-lg border border-[#e1e3e4] px-3 py-1.5 text-sm focus:border-[#00696b] focus:outline-hidden"
                                                />
                                            </div>
                                        )}

                                        {occupantInputs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOccupantInput(idx)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Split Total Validation Display */}
                            <div className="flex justify-between rounded-xl bg-[#f8f9fa] p-3 text-xs font-bold">
                                <span>Calculated Sum: ₹{calculateCurrentSum().toLocaleString("en-IN")}</span>
                                <span
                                    className={
                                        calculateCurrentSum() === selectedRental.monthlyRent
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }
                                >
                                    Target Total: ₹{selectedRental.monthlyRent.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-[#e1e3e4] pt-4">
                            <button
                                type="button"
                                onClick={() => setIsSplitModalOpen(false)}
                                className="rounded-xl border border-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#191c1d]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSplit}
                                disabled={setSplitMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#004f51] disabled:opacity-50"
                            >
                                {setSplitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Rent Split"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Terminate Confirmation Modal (Existing) */}
            {rentalToTerminate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-[#191c1d]">Terminate Rental Lease</h2>
                        <p className="mt-2 text-sm text-[#75777e]">
                            Are you sure you want to terminate the lease for <strong>{rentalToTerminate.property.title}</strong>?
                            This will end occupant agreements and stop future monthly rent invoices.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRentalToTerminate(null)}
                                className="rounded-xl border border-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#191c1d]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmTerminate}
                                disabled={terminateMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {terminateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Confirm Termination"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
