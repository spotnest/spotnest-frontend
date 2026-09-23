export interface SidebarProps {
    role: "user" | "owner" | "admin" | "customer" | "tenant";
    onNavigate?: () => void;
}

