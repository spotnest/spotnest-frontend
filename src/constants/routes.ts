export const dashboardPathForRole = (role?: string): string => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "owner") return "/owner/dashboard";
    if (role === "tenant") return "/tenant/dashboard";

    return "/properties";
};

export const dashboardNotificationsPathForRole = (role: "admin" | "owner" | "tenant" | "user"): string =>
    `/${role}/dashboard/notifications`;

export const dashboardChatPathForRole = (role: "owner" | "tenant" | "user"): string =>
    `/${role}/dashboard/chat`;

export const tenantDashboardRoutes = {
    home: "/tenant/dashboard",
    rental: "/tenant/dashboard/rental",
    payments: "/tenant/dashboard/payments",
    maintenance: "/tenant/dashboard/maintenance",
    notifications: dashboardNotificationsPathForRole("tenant"),
    chat: dashboardChatPathForRole("tenant"),
} as const;
