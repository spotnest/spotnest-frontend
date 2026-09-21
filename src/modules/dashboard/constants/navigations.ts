import { IconName } from "../types/iconName";

export const adminNavigation = [
    { label: "Dashboard", href: "/dashboard", icon: "grid" as IconName },
    { label: "Users", href: "/users", icon: "users" as IconName },
    { label: "Properties", href: "/admin/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Reports", href: "/dashboard#reports", icon: "chart" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

export const userNavigation = [
    { label: "Dashboard", href: "/user/dashboard", icon: "grid" as IconName },
    { label: "My Rental / Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Payments", href: "/user/dashboard#payments", icon: "clock" as IconName },
    { label: "Maintenance", href: "/user/dashboard#maintenance", icon: "alert" as IconName },
    { label: "Notifications", href: "/user/dashboard#notifications", icon: "bell" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

export const ownerNavigation = [
    { label: "Dashboard", href: "/owner/dashboard", icon: "grid" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];