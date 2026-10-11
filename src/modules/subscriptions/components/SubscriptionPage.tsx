"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";
import { useCheckout, usePlans, useSubscription } from "../hooks/useSubscription";
import type { PlanId, PlanPeriod } from "../types/subscription";
import {
    BuyButton,
    formatExpiryDate,
    formatListingLimit,
    formatPlanPrice,
    SubscriptionUsageCard,
} from "./SubscriptionUi";

const PERIOD_LABELS: Record<PlanPeriod, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly (3 months)",
};

export default function SubscriptionPage() {
    const router = useRouter();
    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner =
        user?.role === "owner" && user.verificationStatus === "approved";

    const [period, setPeriod] = useState<PlanPeriod>("monthly");
    const [buyingPlanId, setBuyingPlanId] = useState<string | null>(null);

    const plansQuery = usePlans();
    const subscriptionQuery = useSubscription({ enabled: isInitialized && isOwner });
    const checkout = useCheckout();

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (!isOwner) {
            router.replace(dashboardPathForRole(user.role));
        }
    }, [isInitialized, isOwner, router, user]);

    if (!isInitialized || !user || !isOwner) {
        return null;
    }

    const entitlement = subscriptionQuery.data;
    const catalogue = plansQuery.data;

    const handleBuy = async (planId: PlanId) => {
        setBuyingPlanId(planId);
        try {
            await checkout.buy(planId);
        } finally {
            setBuyingPlanId(null);
        }
    };

    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <p className="text-sm font-semibold text-[#00696b]">
                    Owner workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                    Subscription
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#44474d]">
                    Plans set how many properties you can list and how many photos
                    each listing can carry. You can keep using your existing
                    listings after a plan expires.
                </p>

                {subscriptionQuery.isLoading ? (
                    <div className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white px-5 py-10 text-center text-sm text-[#75777e]">
                        Loading your plan...
                    </div>
                ) : subscriptionQuery.isError ? (
                    <div
                        role="alert"
                        className="mt-8 rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-sm text-[#b42318]"
                    >
                        We could not load your subscription. Please refresh and try
                        again.
                    </div>
                ) : entitlement ? (
                    <SubscriptionUsageCard
                        className="mt-8"
                        planName={
                            entitlement.planId === "free"
                                ? "Free"
                                : entitlement.planName || "Paid plan"
                        }
                        used={entitlement.used}
                        listingLimit={entitlement.listingLimit}
                        expiresAt={entitlement.expiresAt}
                    />
                ) : null}

                {checkout.error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-4 text-sm text-[#b42318]"
                    >
                        <p>{checkout.error}</p>

                        {checkout.hasPendingVerification && (
                            <button
                                type="button"
                                onClick={() => void checkout.retryVerification()}
                                disabled={checkout.isProcessing}
                                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-[#b42318] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f1d14] disabled:opacity-60"
                            >
                                Retry verification
                            </button>
                        )}
                    </div>
                )}

                {plansQuery.isLoading ? (
                    <div className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white px-5 py-10 text-center text-sm text-[#75777e]">
                        Loading plans...
                    </div>
                ) : plansQuery.isError ? (
                    <div
                        role="alert"
                        className="mt-8 rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-sm text-[#b42318]"
                    >
                        We could not load the available plans. Please refresh and
                        try again.
                    </div>
                ) : catalogue ? (
                    <>
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-[-0.03em] text-[#191c1d]">
                                    Choose a plan
                                </h2>

                                <p className="mt-1 text-sm text-[#75777e]">
                                    Quarterly billing costs less than three monthly
                                    payments.
                                </p>
                            </div>

                            <div
                                role="group"
                                aria-label="Billing period"
                                className="flex w-full gap-2 rounded-2xl border border-[#e1e3e4] bg-white p-2 sm:w-auto"
                            >
                                {(["monthly", "quarterly"] as PlanPeriod[]).map(
                                    (value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            aria-pressed={period === value}
                                            onClick={() => setPeriod(value)}
                                            className={`flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition sm:flex-none ${
                                                period === value
                                                    ? "bg-[#00696b] text-white"
                                                    : "text-[#44474d] hover:bg-[#f3f4f5]"
                                            }`}
                                        >
                                            {PERIOD_LABELS[value]}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                            {/* Free is always shown, never sold. */}
                            <article className="flex flex-col rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                <h3 className="text-lg font-bold text-[#191c1d]">
                                    {catalogue.free.name}
                                </h3>

                                <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
                                    {formatPlanPrice(catalogue.free.pricePaise)}
                                    <span className="ml-1 text-sm font-medium text-[#75777e]">
                                        forever
                                    </span>
                                </p>

                                <dl className="mt-5 space-y-2 text-sm text-[#44474d]">
                                    <div className="flex justify-between gap-2">
                                        <dt>Listings</dt>
                                        <dd className="font-semibold">
                                            {formatListingLimit(
                                                catalogue.free.listingLimit
                                            )}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between gap-2">
                                        <dt>Photos per listing</dt>
                                        <dd className="font-semibold">
                                            {catalogue.free.maxImages}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-6">
                                    <BuyButton
                                        label={
                                            entitlement?.planId === "free"
                                                ? "Current plan"
                                                : "Included by default"
                                        }
                                        disabled
                                        onClick={() => undefined}
                                    />
                                </div>
                            </article>

                            {catalogue.tiers.map((group) => {
                                const plan = group.periods[period];

                                // The owner holds one tier at a time. Toggling
                                // the period on the tier they already own should
                                // not offer to "upgrade" to themselves.
                                const ownsTier = Object.values(group.periods).some(
                                    (candidate) => candidate.id === entitlement?.planId
                                );

                                return (
                                    <article
                                        key={group.tier}
                                        className={`flex flex-col rounded-2xl border p-6 ${
                                            group.tier === "pro"
                                                ? "border-[#00696b] bg-[#f2fbfa]"
                                                : "border-[#e1e3e4] bg-white"
                                        }`}
                                    >
                                        <h3 className="text-lg font-bold text-[#191c1d]">
                                            {plan.name}
                                        </h3>

                                        <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
                                            {formatPlanPrice(plan.pricePaise)}
                                            <span className="ml-1 text-sm font-medium text-[#75777e]">
                                                /{plan.durationDays} days
                                            </span>
                                        </p>

                                        <dl className="mt-5 space-y-2 text-sm text-[#44474d]">
                                            <div className="flex justify-between gap-2">
                                                <dt>Listings</dt>
                                                <dd className="font-semibold">
                                                    {formatListingLimit(
                                                        plan.listingLimit
                                                    )}
                                                </dd>
                                            </div>

                                            <div className="flex justify-between gap-2">
                                                <dt>Photos per listing</dt>
                                                <dd className="font-semibold">
                                                    {plan.maxImages}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="mt-6">
                                            <BuyButton
                                                label={
                                                    ownsTier
                                                        ? "Current plan"
                                                        : "Upgrade"
                                                }
                                                // Disable every plan while any
                                                // checkout is in flight, so a
                                                // second order cannot be
                                                // started mid-payment.
                                                disabled={
                                                    ownsTier ||
                                                    checkout.isProcessing
                                                }
                                                // Spinner only on the card
                                                // actually being bought.
                                                // checkout.isProcessing is
                                                // shared across plans, so
                                                // using it here made every
                                                // tier look like it was
                                                // upgrading.
                                                isProcessing={
                                                    buyingPlanId === plan.id
                                                }
                                                onClick={() =>
                                                    void handleBuy(plan.id)
                                                }
                                            />
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {entitlement?.expiresAt && (
                            <p className="mt-6 text-sm text-[#75777e]">
                                Your current plan{" "}
                                {entitlement.planId === "free"
                                    ? "does not expire."
                                    : `expires on ${formatExpiryDate(
                                          entitlement.expiresAt
                                      )}. Existing listings stay live.`}
                            </p>
                        )}
                    </>
                ) : null}
            </main>
        </DashboardShell>
    );
}
