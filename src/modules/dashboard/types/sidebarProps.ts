import type { UserRole } from "@/src/store/type";

export interface SidebarProps {
    role: UserRole;
    onNavigate?: () => void;
}
