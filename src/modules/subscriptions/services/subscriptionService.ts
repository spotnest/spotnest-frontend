import axios from "axios";

import api from "@/src/lib/axios";
import type {
    ApiErrorCode,
    Entitlement,
    PlanCatalogue,
    PlanId,
    SubscriptionOrder,
    SubscriptionVerificationPayload,
} from "../types/subscription";

/**
 * Error body the backend sends for every AppError.
 *
 * `code` is a stable machine-readable contract; `message` is for humans and
 * may be reworded at any time.
 */
export interface ApiErrorBody {
    success: false;
    message: string;
    code?: ApiErrorCode;
}

const errorBody = (error: unknown): Partial<ApiErrorBody> | undefined => {
    if (!axios.isAxiosError(error)) {
        return undefined;
    }

    return error.response?.data as Partial<ApiErrorBody> | undefined;
};

/**
 * Read the backend's machine-readable error code off an axios failure.
 *
 * Returns null for anything that is not a coded API error, so callers can
 * tell "upgrade your plan" apart from a generic failure.
 */
export const getApiErrorCode = (error: unknown): ApiErrorCode | null =>
    errorBody(error)?.code ?? null;

/** Read the backend's human-readable message off an axios failure. */
export const getApiErrorMessage = (error: unknown): string | null => {
    const message = errorBody(error)?.message;
    return typeof message === "string" ? message : null;
};

// GET /subscriptions/plans — public, returns the raw body (no success wrapper).
export const getPlans = async (): Promise<PlanCatalogue> => {
    const { data } = await api.get<PlanCatalogue>("/subscriptions/plans");
    return data;
};

// GET /subscriptions/me — owner only.
export const getMySubscription = async (): Promise<Entitlement> => {
    const { data } = await api.get<Entitlement>("/subscriptions/me");
    return data;
};

// POST /subscriptions/checkout — sends only a planId. The amount is decided
// by the server and never round-trips through the client.
export const createSubscriptionOrder = async (
    planId: PlanId
): Promise<SubscriptionOrder> => {
    const { data } = await api.post<SubscriptionOrder>("/subscriptions/checkout", {
        planId,
    });
    return data;
};

// POST /subscriptions/verify — activates the plan and returns fresh usage.
export const verifySubscriptionPayment = async (
    payload: SubscriptionVerificationPayload
): Promise<Entitlement> => {
    const { data } = await api.post<Entitlement>("/subscriptions/verify", payload);
    return data;
};
