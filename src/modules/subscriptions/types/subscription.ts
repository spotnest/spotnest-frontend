export type PlanTier = "free" | "basic" | "pro";
export type PaidPlanTier = Exclude<PlanTier, "free">;
export type PlanPeriod = "monthly" | "quarterly";

export type PlanId =
    | "free"
    | "basic_monthly"
    | "basic_quarterly"
    | "pro_monthly"
    | "pro_quarterly";

export interface SubscriptionPlan {
    id: PlanId;
    name: string;
    tier: PlanTier;
    period: PlanPeriod | "none";
    /** Paise. The server is the only source of truth for this. */
    pricePaise: number;
    durationDays: number | null;
    /** null means unlimited. */
    listingLimit: number | null;
    maxImages: number;
}

/** One paid card: a tier plus its two billing periods. */
export interface PlanTierGroup {
    tier: PaidPlanTier;
    periods: Record<PlanPeriod, SubscriptionPlan>;
}

export interface PlanCatalogue {
    free: SubscriptionPlan;
    tiers: PlanTierGroup[];
}

/** GET /subscriptions/me and POST /subscriptions/verify */
export interface Entitlement {
    planId: PlanId;
    planName: string;
    tier: PlanTier;
    listingLimit: number | null;
    maxImages: number;
    expiresAt: string | null;
    used: number;
    canCreate: boolean;
}

export interface SubscriptionOrder {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

export interface SubscriptionVerificationPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Codes the backend returns so the UI can offer the right recovery action.
 * Kept as a union so a typo fails the typecheck instead of silently never
 * matching.
 */
export type ApiErrorCode = "LISTING_LIMIT_REACHED" | "IMAGE_LIMIT_REACHED";

export const LISTING_LIMIT_REACHED: ApiErrorCode = "LISTING_LIMIT_REACHED";
