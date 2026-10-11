"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { openRazorpayCheckout } from "@/src/modules/payments/utils/razorpay";
import { useAppSelector } from "@/src/store/hook";
import {
    getApiErrorMessage,
    getMySubscription,
    getPlans,
    createSubscriptionOrder,
    verifySubscriptionPayment,
} from "../services/subscriptionService";
import {
    ownerPropertiesQueryKey,
    subscriptionQueryKeys,
} from "../queryKeys";
import type {
    Entitlement,
    PlanCatalogue,
    PlanId,
    SubscriptionVerificationPayload,
} from "../types/subscription";

/**
 * Current plan, usage and whether another listing can be created.
 *
 * The owner id is only read from Redux to namespace the cache key — the plan
 * itself is never stored in Redux.
 */
export const useSubscription = (options?: { enabled?: boolean }) => {
    const userId = useAppSelector((state) => state.auth.user?.id);

    return useQuery<Entitlement, Error>({
        queryKey: subscriptionQueryKeys.me(userId),
        queryFn: getMySubscription,
        // Entitlement only changes on purchase, an admin toggle, or expiry, so
        // a long stale window avoids a refetch on every dashboard visit.
        staleTime: 60_000,
        enabled: (options?.enabled ?? true) && Boolean(userId),
    });
};

/** Public pricing catalogue. Shared by every visitor, so cache it hard. */
export const usePlans = (options?: { enabled?: boolean }) =>
    useQuery<PlanCatalogue, Error>({
        queryKey: subscriptionQueryKeys.plans,
        queryFn: getPlans,
        staleTime: 5 * 60_000,
        enabled: options?.enabled ?? true,
    });

export interface UseCheckoutResult {
    /** Buy the plan and run the Razorpay checkout. */
    buy: (planId: PlanId) => Promise<void>;
    /** Re-verify a payment whose first verification attempt did not land. */
    retryVerification: () => Promise<void>;
    isProcessing: boolean;
    /** Human-readable failure, or null. Silent when the buyer just closed the modal. */
    error: string | null;
    dismissError: () => void;
    /** True when a payment landed but verification has not succeeded yet. */
    hasPendingVerification: boolean;
}

/**
 * Buy a subscription plan: create the order, open Razorpay, then verify.
 *
 * Mirrors the tenant payment flow in modules/payments — same lazy checkout
 * loader, same keep-the-payload-and-offer-retry shape.
 */
export const useCheckout = (): UseCheckoutResult => {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingVerification, setPendingVerification] =
        useState<SubscriptionVerificationPayload | null>(null);

    const refreshEntitlement = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: subscriptionQueryKeys.me(userId),
            }),
            queryClient.invalidateQueries({ queryKey: ownerPropertiesQueryKey }),
        ]);
    }, [queryClient, userId]);

    const verify = useCallback(
        async (payload: SubscriptionVerificationPayload) => {
            await verifySubscriptionPayment(payload);
            setPendingVerification(null);
            await refreshEntitlement();
        },
        [refreshEntitlement]
    );

    const buy = useCallback(
        async (planId: PlanId) => {
            setError(null);
            setIsProcessing(true);

            try {
                const order = await createSubscriptionOrder(planId);

                await openRazorpayCheckout({
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: "SpotNest",
                    description: `${planId.replace("_", " ")} subscription`,
                    order_id: order.orderId,
                    theme: { color: "#00696b" },
                    handler: async (response) => {
                        const verification: SubscriptionVerificationPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        };

                        // Hold on to the payload before verifying: if the tab
                        // closes or the request fails, the buyer can retry
                        // instead of paying twice.
                        setPendingVerification(verification);

                        try {
                            await verify(verification);
                        } catch {
                            setError(
                                "Payment went through, but we could not confirm it yet. Use Retry verification."
                            );
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                    modal: {
                        // Closing without paying is not an error. The order
                        // stays in "created" server-side, so there is nothing to
                        // report and no toast to fire.
                        ondismiss: () => setIsProcessing(false),
                    },
                });
            } catch (checkoutError) {
                setError(
                    getApiErrorMessage(checkoutError) ??
                        "Unable to start payment. Please try again."
                );
                setIsProcessing(false);
            }
        },
        [verify]
    );

    const retryVerification = useCallback(async () => {
        if (!pendingVerification) {
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            await verify(pendingVerification);
        } catch (retryError) {
            setError(
                getApiErrorMessage(retryError) ??
                    "Verification still did not go through. Please retry."
            );
        } finally {
            setIsProcessing(false);
        }
    }, [pendingVerification, verify]);

    return {
        buy,
        retryVerification,
        isProcessing,
        error,
        dismissError: () => setError(null),
        hasPendingVerification: pendingVerification !== null,
    };
};
