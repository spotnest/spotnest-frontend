export interface DashboardOverview {
    totalUsers: number;
    totalOwners: number;
    totalTenants: number;
    totalRegularUsers: number;
    blockedUsers: number;
    totalProperties: number;
    activeListings: number;
    inactiveListings: number;
    archivedListings: number;
    pendingRequests: number;
    pendingOwnerCount: number;
    pendingUserVerification: number;
    activeRentals: number;
    gracePeriodRentals: number;
    overduePayments: number;
    paymentsReceivedTotal: number;
    paymentsReceivedCount: number;
    lateFeesTotal: number;
    totalMaintenance: number;
    pendingMaintenance: number;
    totalVisits: number;
    pendingVisits: number;
}

export interface DashboardUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "owner" | "tenant" | "user";
    status: "active" | "inactive" | "suspended";
    isVerified: boolean;
    createdAt: string;
}

export interface DashboardActivity {
    id: string;
    title: string;
    detail: string;
    createdAt: string;
    icon: "users" | "home" | "clock" | "alert" | "inbox" | "chart";
    tone: "teal" | "warm" | "ink";
}

export interface DashboardProperty {
    name: string;
    owner: string;
    location: string;
    status: string;
    date: string;
}

export interface AdminDashboardResponse {
    overview: DashboardOverview;
    recentActivities: DashboardActivity[];
    recentUsers: DashboardUser[];
    recentProperties: DashboardProperty[];
}

