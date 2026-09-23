export interface SidebarProps {
    role: "user" | "owner" | "admin" | "tenant";
    onNavigate?: () => void;
}
