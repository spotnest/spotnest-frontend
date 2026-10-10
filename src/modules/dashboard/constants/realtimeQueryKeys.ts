import type { QueryKey } from "@tanstack/react-query";
import type { DashboardScope } from "@/src/lib/socketEvents";
import { bookingKeys } from "@/src/modules/bookings/hooks/useBookings";
import { ownerApprovalRequestsQueryKey } from "@/src/modules/auth/hooks/useOwnerApprovalRequests";
import { ownerDashboardKeys } from "../owner-dashboard/hooks/useOwnerDashboard";

/**
 * Existing TanStack Query keys (prefixes) whose server data depends on each
 * realtime dashboard scope. Invalidation refetches only the queries that are
 * currently mounted and marks the rest stale, so this stays cheap.
 */
const adminDashboard: QueryKey = ["admin-dashboard"];
const tenantAll: QueryKey = ["tenant"]; // tenantKeys.dashboard/rental/payments/maintenance
const tenantRental: QueryKey = ["tenant-rental"];
const tenantAgreement: QueryKey = ["tenant-agreement"];
const ownerRentals: QueryKey = ["owner-rentals"];
const ownerProperties: QueryKey = ["owner-properties"];
const ownerProperty: QueryKey = ["owner-property"];
const adminProperties: QueryKey = ["admin-properties"];
const adminProperty: QueryKey = ["admin-property"];
const adminUsers: QueryKey = ["admin-users"];

export const queryKeysForDashboardScope: Record<DashboardScope, QueryKey[]> = {
    booking: [bookingKeys.all, ownerDashboardKeys.summary, adminDashboard, tenantAll],
    rental: [tenantAll, tenantRental, tenantAgreement, ownerRentals, ownerDashboardKeys.summary, adminDashboard, bookingKeys.all],
    payment: [tenantAll, tenantRental, ownerRentals, ownerDashboardKeys.summary, adminDashboard, bookingKeys.all],
    property: [ownerProperties, ownerProperty, adminProperties, adminProperty, ownerDashboardKeys.summary, adminDashboard],
    user: [adminDashboard, adminUsers, ownerApprovalRequestsQueryKey],
    maintenance: [tenantAll, ownerDashboardKeys.summary],
};

/** Everything that can change while the socket is disconnected. */
export const allRealtimeDashboardKeys: QueryKey[] = Object.values(queryKeysForDashboardScope).flat();
