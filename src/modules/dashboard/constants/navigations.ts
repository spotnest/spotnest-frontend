import { dashboardNotificationsPathForRole, tenantDashboardRoutes } from "@/src/constants/routes";
import { IconName } from "../types/iconName";

export interface NavigationItem {
    label: string;
    href: string;
    icon: IconName;
    children?: { label: string; href: string }[];
}

export const adminNavigation: NavigationItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "grid" as IconName },
    { label: "Users", href: "/users", icon: "users" as IconName },
    { label: "Properties", href: "/admin/properties", icon: "home" as IconName },
    { label: "Requests", href: "/requests/owner-approvals", icon: "inbox" as IconName },
    { label: "Reports", href: "/admin/dashboard#reports", icon: "chart" as IconName },
    { label: "Notifications", href: dashboardNotificationsPathForRole("admin"), icon: "bell" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

export const tenantNavigation: NavigationItem[] = [
    { label: "Dashboard", href: tenantDashboardRoutes.home, icon: "grid" as IconName },
    { label: "My Rental / Properties", href: tenantDashboardRoutes.rental, icon: "home" as IconName },
    { label: "Payments", href: tenantDashboardRoutes.payments, icon: "clock" as IconName },
    { label: "Maintenance", href: tenantDashboardRoutes.maintenance, icon: "alert" as IconName },
    { label: "Notifications", href: tenantDashboardRoutes.notifications, icon: "bell" as IconName },
];

export const ownerNavigation: NavigationItem[] = [
    { label: "Dashboard", href: "/owner/dashboard", icon: "grid" as IconName },
    { label: "Properties", href: "/owner/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Notifications", href: dashboardNotificationsPathForRole("owner"), icon: "bell" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];
