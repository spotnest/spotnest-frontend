"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

/**
 * Format paise as an Indian-rupee amount.
 *
 * Intl builds the rupee glyph at runtime, so no currency symbol is ever
 * hardcoded in this file (the repo already has hand-typed glyphs that got
 * corrupted by an editor encoding).
 */
export const formatPlanPrice = (pricePaise: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(pricePaise / 100);

export const formatExpiryDate = (iso: string | null): string => {
    if (!iso) {
        return "";
    }

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

/** Human label for a listing cap. Null means unlimited. */
export const formatListingLimit = (limit: number | null): string =>
    limit === null ? "Unlimited" : String(limit);

interface ListingUsageProps {
    used: number;
    limit: number | null;
    label?: string;
    className?: string;
}

/**
 * "2 / 5 listings" plus a proportional bar.
 *
 * Reads only what it is given — limits always come from
 * GET /subscriptions/me so this component never encodes plan numbers.
 */
export function ListingUsage({ used, limit, label = "listings", className = "" }: ListingUsageProps) {
    const percent = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const atCapacity = limit !== null && used >= limit;

    return (
        <div className={className}>
            <p
                className={`text-sm font-semibold ${atCapacity ? "text-[#b42318]" : "text-[#44474d]"}`}
            >
                {used} / {formatListingLimit(limit)} {label}
            </p>

            {limit !== null && (
                <div
                    aria-hidden="true"
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e1e3e4]"
                >
                    <div
                        className={`h-full rounded-full transition-all ${atCapacity ? "bg-[#b42318]" : "bg-[#00696b]"}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </div>
    );
}

interface SubscriptionUsageCardProps {
    planName: string;
    used: number;
    listingLimit: number | null;
    expiresAt: string | null;
    className?: string;
}

/** Current-plan summary with the usage meter. */
export function SubscriptionUsageCard({
    planName,
    used,
    listingLimit,
    expiresAt,
    className = "",
}: SubscriptionUsageCardProps) {
    const expiry = formatExpiryDate(expiresAt);

    return (
        <section
            className={`rounded-2xl border border-[#e1e3e4] bg-white p-6 ${className}`}
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">
                        Current plan
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#191c1d]">
                        {planName}
                    </p>
                </div>

                {expiry && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#d9f4f3] px-3 py-1.5 text-xs font-semibold text-[#004f51]">
                        Renews {expiry}
                    </span>
                )}
            </div>

            <ListingUsage used={used} limit={listingLimit} className="mt-5" />
        </section>
    );
}

interface UpgradeLimitModalProps {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    actionLabel?: string;
}

/**
 * Shown when the server rejects a create with LISTING_LIMIT_REACHED.
 *
 * The server is the only authority on the limit; this modal just reacts to
 * the error code it returned.
 */
export function UpgradeLimitModal({
    open,
    title = "You've reached your plan limit",
    message,
    onClose,
    actionLabel = "View plans",
}: UpgradeLimitModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
        >
            <div className="w-full max-w-md rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-[-0.02em] text-[#191c1d]">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#44474d]">{message}</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#c5c6cd] bg-white px-4 py-2.5 text-sm font-semibold text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        Not now
                    </button>

                    <Link
                        href="/owner/subscription"
                        onClick={onClose}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                    >
                        {actionLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}

interface BuyButtonProps {
    label: string;
    disabled?: boolean;
    isProcessing?: boolean;
    onClick: () => void;
}

/** Shared Buy / Upgrade button so every card looks identical. */
export function BuyButton({ label, disabled, isProcessing, onClick }: BuyButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isProcessing}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {label}
        </button>
    );
}
