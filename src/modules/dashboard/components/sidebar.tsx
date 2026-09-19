import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { IconName } from "../types/iconName";
import { SidebarProps } from "../types/sidebarProps";

const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: "grid" as IconName },
    { label: "Users", href: "/users", icon: "users" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Reports", href: "/dashboard#reports", icon: "chart" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];


export default function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[#e1e3e4] bg-white px-4 py-5">
            <Link href="/" className="flex items-center gap-2 px-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00696b] text-sm font-bold text-white">S</span>
                <span className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">SpotNest</span>
            </Link>

            <div className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#75777e]">Workspace</div>
            <nav className="mt-3 space-y-1" aria-label="Admin navigation">
                {navigation.map((item) => {
                    const routePath = item.href.split("#")[0];
                    const isActive = routePath === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === routePath || pathname.startsWith(`${routePath}/`);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-[#d9f4f3] text-[#00696b]" : "text-[#44474d] hover:bg-[#f3f4f5] hover:text-[#191c1d]"}`}
                        >
                            <Icon name={item.icon} className="h-[18px] w-[18px]" />
                            {item.label}
                            {item.label === "Requests" && <span className="ml-auto rounded-full bg-[#00696b] px-2 py-0.5 text-[10px] font-bold text-white">8</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-2xl bg-[#eef6f5] p-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-bold text-[#00696b]">SN</div>
                <p className="mt-4 text-sm font-semibold text-[#191c1d]">Need a hand?</p>
                <p className="mt-1 text-xs leading-5 text-[#44474d]">Our support team is ready to help.</p>
                <button type="button" className="mt-3 text-xs font-bold text-[#00696b] transition hover:text-[#004f51]">Contact support <span aria-hidden="true">→</span></button>
            </div>
        </aside>
    );
}