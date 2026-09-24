export const dashboardPathForRole = (role?: string): string => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "owner") return "/owner/dashboard";

    return "/properties";
};
