"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Users, CheckCircle, AlertTriangle, XCircle, ArrowLeft } from "lucide-react";
import {
    useConfirmAgreement,
    useOwnerRentals,
    useSetRentSplit,
    useTerminateRental,
} from "@/src/modules/rentals/hooks/useRentals";
import type { OwnerRentalItem } from "@/src/modules/rentals/services/rentalService";

export default function OwnerRentalsPage() {
    const rentalsQuery = useOwnerRentals();
    const confirmMutation = useConfirmAgreement();
    const setSplitMutation = useSetRentSplit();
    const terminateMutation = useTerminateRental();

    const [selectedRental, setSelectedRental] = useState<OwnerRentalItem | null>(null);
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
    const [splitMode, setSplitMode] = useState<"EQUAL" | "CUSTOM">("EQUAL");
    const [occupantInputs, setOccupantInputs] = useState<
        Array<{ tenantEmail: string; rentAmount: number; securityDepositShare: number }>
    >([]);
    const [splitError, setSplitError] = useState<string | null>(null);

    const [rentalToTerminate, setRentalToTerminate] = useState<OwnerRentalItem | null>(null);

    const rentals = rentalsQuery.data ?? [];

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

        // Validation: Sum of shares must equal total monthly rent
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
            const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || "Failed to update rent split.";
            setSplitError(message);
        }
    };

    const handleConfirmAgreement = async (agreementId: string) => {
        try {
            await confirmMutation.mutateAsync(agreementId);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || "Failed to confirm agreement";
            alert(message);
        }
    };

    const handleConfirmTerminate = async () => {
        if (!rentalToTerminate) return;
        try {
            await terminateMutation.mutateAsync({ rentalId: rentalToTerminate.id });
            setRentalToTerminate(null);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || "Failed to terminate rental";
            alert(message);
        }
    };

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
                <Link
                    href="/owner"
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
                        Manage property tenancies, shared occupant rent splits, agreements, and monthly rent statuses.
                    </p>
                </div>
            </div>

            {rentalsQuery.isLoading ? (
                <div className="mt-10 flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00696b]" />
                </div>
            ) : rentals.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-10 text-center">
                    <h3 className="text-lg font-bold text-[#191c1d]">No active property rentals</h3>
                    <p className="mt-1 text-sm text-[#75777e]">
                        When tenants make advance payments for approved booking requests, their rentals will appear here.
                    </p>
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
                                                                        : occ.agreementStatus === "PENDING_OWNER"
                                                                          ? "bg-[#dbeafe] text-[#1e4f91]"
                                                                          : "bg-[#fff3cd] text-[#765b00]"
                                                                }`}
                                                            >
                                                                {occ.agreementStatus}
                                                            </span>
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
                                                            {occ.agreementStatus === "PENDING_OWNER" && occ.agreementId && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleConfirmAgreement(occ.agreementId!)}
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
                                <div className="mt-6 border-t border-[#e1e3e4] pt-4 flex justify-end">
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

            {/* Manage Rent Split Modal */}
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
                                    <div key={idx} className="flex flex-col gap-2 rounded-xl border border-[#e1e3e4] p-3 sm:flex-row sm:items-center">
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
                                                    onChange={(e) => handleOccupantChange(idx, "rentAmount", Number(e.target.value))}
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
                            <div className="rounded-xl bg-[#f8f9fa] p-3 text-xs flex justify-between font-bold">
                                <span>Calculated Sum: ₹{calculateCurrentSum().toLocaleString("en-IN")}</span>
                                <span className={calculateCurrentSum() === selectedRental.monthlyRent ? "text-green-700" : "text-red-600"}>
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

            {/* Terminate Confirmation Modal */}
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
                                {terminateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Termination"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
