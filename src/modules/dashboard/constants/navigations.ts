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
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

export const tenantNavigation: NavigationItem[] = [
    { label: "Dashboard", href: "/tenant/dashboard", icon: "grid" as IconName },
    { label: "My Rental / Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Payments", href: "/tenant/dashboard#payments", icon: "clock" as IconName },
    { label: "Maintenance", href: "/tenant/dashboard#maintenance", icon: "alert" as IconName },
    { label: "Notifications", href: "/tenant/dashboard/notifications", icon: "bell" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

export const ownerNavigation: NavigationItem[] = [
    { label: "Dashboard", href: "/owner/dashboard", icon: "grid" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];
