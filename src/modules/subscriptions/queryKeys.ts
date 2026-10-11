/**
 * Cache keys are namespaced per feature. The entitlement is owner-specific, so
 * every key carries the owner id — a shared browser tab switching accounts must
 * not show the previous owner's usage.
 */
export const subscriptionQueryKeys = {
    all: ["subscriptions"] as const,
    me: (userId: string | undefined) => ["subscriptions", "me", userId] as const,
    plans: ["subscriptions", "plans"] as const,
};

/** Owner property listings react to a plan change (the limit gates creation). */
export const ownerPropertiesQueryKey = ["owner-properties"] as const;
