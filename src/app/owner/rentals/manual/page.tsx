"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    FileText,
    Info,
    Loader2,
    Mail,
    Send,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { useCreateManualAgreement, useLookupTenant } from "@/src/modules/rentals/hooks/useRentals";
import { getMyProperties } from "@/src/modules/properties/services/propertyService";
import { useAppSelector } from "@/src/store/hook";

const getDefaultTerms = (
    rent: number | string,
    deposit: number | string,
    noticeDays: number,
    maintenance: number | string
) => {
    const formattedRent = Number(rent) > 0 ? `₹${Number(rent).toLocaleString("en-IN")}` : "[Monthly Rent]";
    const formattedDeposit = Number(deposit) >= 0 ? `₹${Number(deposit).toLocaleString("en-IN")}` : "[Security Deposit]";
    const formattedMaint = Number(maintenance) > 0 ? `₹${Number(maintenance).toLocaleString("en-IN")}` : "₹0";

    return `STANDARD RESIDENTIAL LEASE AGREEMENT

1. PURPOSE & PREMISES: The Owner agrees to lease and the Tenant agrees to occupy the premises exclusively for residential purposes in compliance with all society bylaws.

2. MONTHLY RENT: The Tenant agrees to pay the monthly rent of ${formattedRent} on or before the 5th day of every calendar month.

3. SECURITY DEPOSIT / ADVANCE: A refundable security deposit of ${formattedDeposit} must be paid prior to move-in. This deposit will be held during tenancy and refunded within 30 days of vacating, subject to deductions for damages or unpaid utilities.

4. MAINTENANCE & UTILITIES: Monthly maintenance fee is ${formattedMaint}. Electricity, water, and other utility usage charges shall be borne directly by the Tenant.

5. NOTICE PERIOD & TERMINATION: Either party may terminate this agreement by providing a minimum of ${noticeDays} days written notice.

6. INSPECTIONS & REPAIRS: The Owner reserves the right to inspect the property with prior 24-hour notice. The Tenant agrees to maintain the property in clean and habitable condition.`;
};

export default function ManualRentalAgreementPage() {
    const router = useRouter();
    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner = user?.role === "owner" && user.verificationStatus === "approved";

    const propertiesQuery = useQuery({
        queryKey: ["owner-properties"],
        queryFn: getMyProperties,
        enabled: isInitialized && isOwner,
    });

    const createMutation = useCreateManualAgreement();

    // Form State
    const [propertyId, setPropertyId] = useState("");
    const [tenantEmail, setTenantEmail] = useState("");
    const [monthlyRent, setMonthlyRent] = useState<number | string>("");
    const [securityDeposit, setSecurityDeposit] = useState<number | string>("");
    const [maintenanceFee, setMaintenanceFee] = useState<number | string>("0");
    const [noticePeriodDays, setNoticePeriodDays] = useState(30);
    const [leaseStart, setLeaseStart] = useState("");
    const [leaseEnd, setLeaseEnd] = useState("");
    const [terms, setTerms] = useState("");
    const [autoSend, setAutoSend] = useState(true);
    const [hasCustomTerms, setHasCustomTerms] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Default dates (Start tomorrow, End in 11 months)
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextYear = new Date(tomorrow);
        nextYear.setMonth(nextYear.getMonth() + 11);

        const startStr = tomorrow.toISOString().split("T")[0]!;
        const endStr = nextYear.toISOString().split("T")[0]!;

        setLeaseStart(startStr);
        setLeaseEnd(endStr);
    }, []);

    // Set default terms initially or update if user hasn't explicitly customized
    useEffect(() => {
        if (!hasCustomTerms) {
            setTerms(getDefaultTerms(monthlyRent, securityDeposit, noticePeriodDays, maintenanceFee));
        }
    }, [monthlyRent, securityDeposit, noticePeriodDays, maintenanceFee, hasCustomTerms]);

    // Tenant lookup query (debounced by React Query / email pattern)
    const normalizedEmail = tenantEmail.trim().toLowerCase();
    const tenantLookupQuery = useLookupTenant(normalizedEmail);

    const properties = propertiesQuery.data ?? [];
    const selectedProperty = useMemo(
        () => properties.find((p) => p._id === propertyId),
        [properties, propertyId]
    );

    // Auto-fill rent/deposit from selected property
    const handlePropertyChange = (newPropertyId: string) => {
        setPropertyId(newPropertyId);
        const prop = properties.find((p) => p._id === newPropertyId);
        if (prop) {
            const price = prop.price || 0;
            setMonthlyRent(price);
            setSecurityDeposit(price * 2);
        }
    };

    const handleResetTerms = () => {
        setHasCustomTerms(false);
        setTerms(getDefaultTerms(monthlyRent, securityDeposit, noticePeriodDays, maintenanceFee));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSuccessMessage(null);

        if (!propertyId) {
            setFormError("Please select a property for this rental agreement.");
            return;
        }

        if (!tenantEmail || !tenantEmail.includes("@")) {
            setFormError("Please enter a valid tenant email address.");
            return;
        }

        const rentNum = Number(monthlyRent);
        const depositNum = Number(securityDeposit);
        const maintNum = Number(maintenanceFee) || 0;

        if (isNaN(rentNum) || rentNum <= 0) {
            setFormError("Monthly rent must be greater than 0.");
            return;
        }

        if (isNaN(depositNum) || depositNum < 0) {
            setFormError("Security deposit cannot be negative.");
            return;
        }

        if (!leaseStart || !leaseEnd) {
            setFormError("Lease start and end dates are required.");
            return;
        }

        if (new Date(leaseEnd) <= new Date(leaseStart)) {
            setFormError("Lease end date must be after the start date.");
            return;
        }

        if (terms.trim().length < 20) {
            setFormError("Agreement terms must contain at least 20 characters.");
            return;
        }

        try {
            await createMutation.mutateAsync({
                propertyId,
                tenantEmail: normalizedEmail,
                monthlyRent: rentNum,
                securityDeposit: depositNum,
                maintenanceFee: maintNum,
                paymentFrequency: "monthly",
                noticePeriodDays: Number(noticePeriodDays) || 30,
                leaseStart,
                leaseEnd,
                terms: terms.trim(),
                autoSend,
            });

            setSuccessMessage(
                autoSend
                    ? "Rental agreement created successfully! Notification email dispatched to the tenant."
                    : "Rental agreement created successfully in draft mode."
            );

            setTimeout(() => {
                router.push("/owner/rentals");
            }, 1800);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err as Error)?.message ||
                "Failed to create manual rental agreement.";
            setFormError(msg);
        }
    };

    return (
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
            {/* Header & Back Navigation */}
            <div className="flex items-center gap-2">
                <Link
                    href="/owner/rentals"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00696b] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Rental Management
                </Link>
            </div>

            <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#00696b]">Owner Portal</p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#191c1d]">
                    Create Manual Rental Agreement
                </h1>
                <p className="mt-1 text-base text-[#44474d]">
                    Draft a binding rental agreement directly for an offline or walk-in tenant, specify terms and advance
                    deposit, and automatically deliver it to the tenant.
                </p>
            </div>

            {/* Success Banner */}
            {successMessage && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm font-semibold">{successMessage}</p>
                </div>
            )}

            {/* Error Banner */}
            {formError && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
                    <p className="text-sm font-semibold">{formError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                {/* Section 1: Property Selection */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center gap-2 border-b border-[#e1e3e4] pb-4">
                        <Building2 className="h-5 w-5 text-[#00696b]" />
                        <h2 className="text-lg font-bold text-[#191c1d]">1. Select Property</h2>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="propertySelect" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                                Property Listing *
                            </label>
                            {propertiesQuery.isLoading ? (
                                <div className="mt-2 flex items-center gap-2 text-sm text-[#75777e]">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#00696b]" /> Loading your properties...
                                </div>
                            ) : properties.length === 0 ? (
                                <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                    You have no listed properties yet. Please add a property first.
                                </div>
                            ) : (
                                <select
                                    id="propertySelect"
                                    value={propertyId}
                                    onChange={(e) => handlePropertyChange(e.target.value)}
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#c4c7c8] bg-white px-3.5 py-2.5 text-sm font-medium text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                                >
                                    <option value="">-- Choose one of your properties --</option>
                                    {properties.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.title} — ₹{p.price?.toLocaleString("en-IN")}/mo ({p.address?.city})
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="mt-1.5 text-xs text-[#75777e]">
                                Selecting a property will automatically prefill default rent and security deposit.
                            </p>
                        </div>

                        {selectedProperty && (
                            <div className="rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#00696b]">Selected Property Preview</span>
                                <h3 className="mt-1 font-bold text-[#191c1d]">{selectedProperty.title}</h3>
                                <p className="mt-0.5 text-xs text-[#44474d]">
                                    {selectedProperty.address?.street ? `${selectedProperty.address.street}, ` : ""}
                                    {selectedProperty.address?.city}, {selectedProperty.address?.state}
                                </p>
                                <div className="mt-2 flex gap-4 text-xs font-semibold text-[#00696b]">
                                    <span>Type: {selectedProperty.propertyType}</span>
                                    <span>Base Rent: ₹{selectedProperty.price?.toLocaleString("en-IN")}/mo</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Tenant Information */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center gap-2 border-b border-[#e1e3e4] pb-4">
                        <Mail className="h-5 w-5 text-[#00696b]" />
                        <h2 className="text-lg font-bold text-[#191c1d]">2. Tenant Details</h2>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="tenantEmailInput" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                                Tenant Email Address *
                            </label>
                            <input
                                id="tenantEmailInput"
                                type="email"
                                value={tenantEmail}
                                onChange={(e) => setTenantEmail(e.target.value)}
                                placeholder="tenant@example.com"
                                required
                                className="mt-2 w-full rounded-xl border border-[#c4c7c8] px-3.5 py-2.5 text-sm font-medium text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                            <p className="mt-1.5 text-xs text-[#75777e]">
                                An agreement acceptance invite will be linked to this email address.
                            </p>
                        </div>

                        {/* Tenant lookup feedback */}
                        <div className="flex flex-col justify-center">
                            {tenantLookupQuery.isLoading ? (
                                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-[#75777e]">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#00696b]" />
                                    Verifying tenant account...
                                </div>
                            ) : tenantLookupQuery.data ? (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Verified Registered Tenant Found
                                    </div>
                                    <p className="mt-1 font-semibold">
                                        Name: {tenantLookupQuery.data.name}
                                    </p>
                                    <p className="text-emerald-700">Email: {tenantLookupQuery.data.email}</p>
                                </div>
                            ) : normalizedEmail.includes("@") && normalizedEmail.length >= 6 ? (
                                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                                    <div className="flex items-center gap-1.5 font-bold text-blue-800">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        New Tenant Invitation
                                    </div>
                                    <p className="mt-1 text-blue-800">
                                        No existing account found with this email. An invitation and agreement link will be emailed to create their account and accept.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-[#f8f9fa] p-3 text-xs text-[#75777e]">
                                    Enter tenant&apos;s email address to verify account eligibility.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Financial Terms (Monthly Rent vs Advance Deposit) */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#191c1d]">3. Financial & Payment Terms</span>
                        </div>
                        <span className="rounded-full bg-[#d9f4f3] px-3 py-1 text-xs font-bold text-[#00696b]">
                            Clearly Distinguished
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {/* Monthly Rent */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                            <label htmlFor="monthlyRentInput" className="block text-xs font-extrabold uppercase tracking-wider text-blue-900">
                                Monthly Rent (₹) *
                            </label>
                            <input
                                id="monthlyRentInput"
                                type="number"
                                min="1"
                                step="100"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                placeholder="e.g. 15000"
                                required
                                className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-base font-bold text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                            <p className="mt-1.5 text-xs text-[#75777e]">
                                Recurring monthly rent due on the 5th of each month.
                            </p>
                        </div>

                        {/* Security Deposit / Advance */}
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                            <label htmlFor="securityDepositInput" className="block text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                                Security Deposit / Advance (₹) *
                            </label>
                            <input
                                id="securityDepositInput"
                                type="number"
                                min="0"
                                step="500"
                                value={securityDeposit}
                                onChange={(e) => setSecurityDeposit(e.target.value)}
                                placeholder="e.g. 30000"
                                required
                                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-base font-bold text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                            <p className="mt-1.5 text-xs text-[#75777e]">
                                One-time advance payment required before tenancy becomes active.
                            </p>
                        </div>

                        {/* Maintenance Fee */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                            <label htmlFor="maintenanceFeeInput" className="block text-xs font-extrabold uppercase tracking-wider text-[#44474d]">
                                Maintenance Fee (₹/mo)
                            </label>
                            <input
                                id="maintenanceFeeInput"
                                type="number"
                                min="0"
                                step="100"
                                value={maintenanceFee}
                                onChange={(e) => setMaintenanceFee(e.target.value)}
                                placeholder="0"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base font-bold text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                            <p className="mt-1.5 text-xs text-[#75777e]">
                                Optional society / maintenance charges per month.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[#44474d]">
                        <div>
                            Payment Frequency: <span className="font-bold text-[#191c1d]">Monthly</span>
                        </div>
                        <div>
                            Payment Method: <span className="font-bold text-[#191c1d]">Razorpay / Online Invoicing</span>
                        </div>
                    </div>
                </div>

                {/* Section 4: Lease Timeline & Notice Period */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center gap-2 border-b border-[#e1e3e4] pb-4">
                        <Calendar className="h-5 w-5 text-[#00696b]" />
                        <h2 className="text-lg font-bold text-[#191c1d]">4. Lease Dates & Notice Period</h2>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label htmlFor="leaseStartInput" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                                Lease Start Date *
                            </label>
                            <input
                                id="leaseStartInput"
                                type="date"
                                value={leaseStart}
                                onChange={(e) => setLeaseStart(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl border border-[#c4c7c8] px-3.5 py-2.5 text-sm font-medium text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label htmlFor="leaseEndInput" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                                Lease End Date *
                            </label>
                            <input
                                id="leaseEndInput"
                                type="date"
                                value={leaseEnd}
                                onChange={(e) => setLeaseEnd(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl border border-[#c4c7c8] px-3.5 py-2.5 text-sm font-medium text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label htmlFor="noticePeriodInput" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                                Notice Period (Days) *
                            </label>
                            <input
                                id="noticePeriodInput"
                                type="number"
                                min="1"
                                max="180"
                                value={noticePeriodDays}
                                onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                                required
                                className="mt-2 w-full rounded-xl border border-[#c4c7c8] px-3.5 py-2.5 text-sm font-medium text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Agreement Terms & Custom Clauses */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col justify-between gap-2 border-b border-[#e1e3e4] pb-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#00696b]" />
                            <h2 className="text-lg font-bold text-[#191c1d]">5. Agreement Terms & Clauses</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetTerms}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#00696b] hover:underline"
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Reset to Standard Template
                        </button>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="termsTextarea" className="block text-xs font-bold uppercase tracking-wider text-[#44474d]">
                            Full Terms & Custom Clauses * (Minimum 20 characters)
                        </label>
                        <textarea
                            id="termsTextarea"
                            rows={12}
                            value={terms}
                            onChange={(e) => {
                                setTerms(e.target.value);
                                setHasCustomTerms(true);
                            }}
                            required
                            className="mt-2 w-full rounded-xl border border-[#c4c7c8] p-4 font-mono text-xs leading-relaxed text-[#191c1d] focus:border-[#00696b] focus:outline-hidden"
                        />
                        <p className="mt-1.5 text-xs text-[#75777e]">
                            Both parties will digitally sign and agree to these terms. A snapshot of these terms is permanently preserved for legal and audit compliance.
                        </p>
                    </div>
                </div>

                {/* Section 6: Delivery & Dispatch Options */}
                <div className="rounded-2xl border border-[#e1e3e4] bg-[#f8f9fa] p-6 sm:p-8">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="autoSendCheckbox"
                            checked={autoSend}
                            onChange={(e) => setAutoSend(e.target.checked)}
                            className="mt-1 h-5 w-5 rounded border-[#c4c7c8] text-[#00696b] focus:ring-[#00696b]"
                        />
                        <div>
                            <label htmlFor="autoSendCheckbox" className="text-sm font-bold text-[#191c1d] cursor-pointer">
                                Automatically send email notification and agreement invitation to tenant
                            </label>
                            <p className="mt-1 text-xs text-[#44474d]">
                                When checked, an email with the agreement details and direct link will be immediately dispatched via Resend. Uncheck to save as an unsigned draft without notifying the tenant immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row sm:items-center">
                    <Link
                        href="/owner/rentals"
                        className="rounded-xl border border-[#c4c7c8] px-6 py-3 text-center text-sm font-semibold text-[#191c1d] hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-8 py-3 text-sm font-bold text-white hover:bg-[#004f51] disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating Agreement...
                            </>
                        ) : autoSend ? (
                            <>
                                <Send className="h-4 w-4" />
                                Create & Dispatch Agreement
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4" />
                                Save Draft Agreement
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

