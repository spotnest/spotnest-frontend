/**
 * The maintenance enums, mirroring the Mongoose schema in
 * spotnest-backend/src/modules/maintenance/model.ts. These arrays are the
 * values sent over the wire; the *_LABELS maps below are what users read.
 * Never render a value directly or post a label -- that mismatch is what made
 * the API reject requests with "Normal is not a valid enum value".
 */
export const MAINTENANCE_CATEGORIES = [
    "Plumbing",
    "Electrical",
    "Appliance",
    "Structural",
    "Cleaning",
    "Other",
] as const;

export const MAINTENANCE_PRIORITIES = [
    "Low",
    "Normal",
    "High",
    "Emergency",
] as const;

export const MAINTENANCE_STATUSES = [
    "PENDING",
    "ACCEPTED",
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
] as const;

/** Sentinel for "no filter"; the API strips it instead of matching on it. */
export const ALL_FILTER = "ALL";

export const CATEGORY_LABELS: Record<(typeof MAINTENANCE_CATEGORIES)[number], string> = {
    Plumbing: "Plumbing",
    Electrical: "Electrical",
    Appliance: "Appliance",
    Structural: "Structural",
    Cleaning: "Cleaning",
    Other: "Other",
};

export const PRIORITY_LABELS: Record<(typeof MAINTENANCE_PRIORITIES)[number], string> = {
    Low: "Low",
    Normal: "Normal",
    High: "High",
    Emergency: "Emergency",
};

export const STATUS_LABELS: Record<(typeof MAINTENANCE_STATUSES)[number], string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
};

export interface SelectOption<T extends string> {
    value: T;
    label: string;
}

const toOptions = <T extends string>(
    values: readonly T[],
    labels: Record<T, string>
): SelectOption<T>[] => values.map((value) => ({ value, label: labels[value] }));

export const CATEGORY_OPTIONS = toOptions(MAINTENANCE_CATEGORIES, CATEGORY_LABELS);
export const PRIORITY_OPTIONS = toOptions(MAINTENANCE_PRIORITIES, PRIORITY_LABELS);
export const STATUS_OPTIONS = toOptions(MAINTENANCE_STATUSES, STATUS_LABELS);
