/** Mirrors GET /owner/dashboard (spotnest-backend ownerDashboard/type.ts). */
export interface OwnerDashboardRecentRequest {
    id: string;
    propertyTitle: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    createdAt: string;
}

export interface OwnerDashboardRecentPayment {
    id: string;
    type: string;
    status: string;
    amount: number;
    billingMonth?: string;
    dueDate?: string;
    paidAt?: string;
    propertyTitle: string;
    tenantName: string;
    updatedAt: string;
}

export interface OwnerDashboardData {
    properties: { total: number; active: number; inactive: number; archived: number };
    requests: { pending: number; awaitingAdvance: number };
    rentals: { active: number; scheduled: number; agreementsAwaitingConfirmation: number };
    payments: {
        currency: "INR";
        totalReceived: number;
        receivedThisMonth: number;
        outstandingRent: number;
        overdueCount: number;
    };
    recentRequests: OwnerDashboardRecentRequest[];
    recentPayments: OwnerDashboardRecentPayment[];
}
