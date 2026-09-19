"use client";

import Link from "next/link";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { DashboardUser } from "../types/dashboard";
import { IconName } from "../../types/iconName";
import { Icon } from "../../components/Icon";

function formatRelativeTime(value: string): string {
    const elapsed = Date.now() - new Date(value).getTime();
    const minutes = Math.max(0, Math.floor(elapsed / 60_000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function getUserRole(user: DashboardUser): string {
    return user.role === "owner" ? "Owner" : user.role === "admin" ? "Administrator" : "Renter";
}

function getUserColor(user: DashboardUser): string {
    if (user.role === "owner") return "bg-[#e8e4fb] text-[#4c3a9e]";
    if (!user.isVerified) return "bg-[#f8e9d6] text-[#8a5a20]";
    return "bg-[#d9f4f3] text-[#00696b]";
}

function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00696b]">{eyebrow}</p>
                <h2 className="text-xl font-bold tracking-[-0.025em] text-[#191c1d]">{title}</h2>
            </div>
            {link && <Link href={link} className="shrink-0 text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]">View all <span aria-hidden="true">→</span></Link>}
        </div>
    );
}

function Status({ children }: { children: string }) {
    const styles = children === "Live" || children === "Active" ? "bg-[#d9f4f3] text-[#00696b]" : children === "Pending" || children === "Review" ? "bg-[#fff0dc] text-[#95611d]" : "bg-[#f3f4f5] text-[#44474d]";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles}`}><span className="mr-1.5">{children === "Live" || children === "Active" ? "●" : "○"}</span>{children}</span>;
}

export default function AdminDashboard() {
    const { data, isLoading, isError, error } = useAdminDashboard();

    if (isLoading) {
        return <div className="mx-auto max-w-[1500px] px-4 py-10 text-sm text-[#44474d] sm:px-6 lg:px-10">Loading dashboard...</div>;
    }

    if (isError || !data) {
        return <div className="mx-auto max-w-[1500px] px-4 py-10 text-sm text-[#95611d] sm:px-6 lg:px-10">Unable to load dashboard data{error instanceof Error ? `: ${error.message}` : "."}</div>;
    }

    const { overview, recentActivities, recentUsers, recentProperties } = data;
    const stats = [
        { label: "Total users", value: overview.totalUsers, change: "Current total", note: "registered accounts", icon: "users" as IconName, tone: "teal" },
        { label: "Total properties", value: overview.totalProperties, change: "No property data", note: "available yet", icon: "home" as IconName, tone: "ink" },
        { label: "Active listings", value: overview.activeListings, change: "No property data", note: "available yet", icon: "chart" as IconName, tone: "teal" },
        { label: "Pending requests", value: overview.pendingRequests, change: "No booking data", note: "available yet", icon: "inbox" as IconName, tone: "warm" },
    ];
    const actions = [
        { label: "Manage users", description: "View all accounts", href: "/users", icon: "users" as IconName },
        { label: "Review requests", description: `${overview.pendingRequests} requests`, href: "/bookings", icon: "inbox" as IconName },
        { label: "View reports", description: "Track platform health", href: "/dashboard#reports", icon: "chart" as IconName },
    ];
    const pendingActions: Array<[string, string, IconName]> = [
        ["Properties waiting for approval", `${overview.totalProperties - overview.activeListings} properties`, "home" as IconName],
        ["Requests to review", `${overview.pendingRequests} requests`, "inbox" as IconName],
        ["User verification", `${overview.pendingUserVerification} accounts`, "users" as IconName],
        ["Reports requiring review", "No report data", "alert" as IconName],
    ];

    return (
        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">Admin overview</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">SpotNest platform overview.</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#44474d] sm:text-base">Here&apos;s what&apos;s happening across SpotNest today.</p>
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform statistics">
                {stats.map((stat) => (
                    <article key={stat.label} className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.035)]">
                        <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-[#44474d]">{stat.label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${stat.tone === "teal" ? "bg-[#d9f4f3] text-[#00696b]" : stat.tone === "warm" ? "bg-[#fff0dc] text-[#95611d]" : "bg-[#eef0f1] text-[#191c1d]"}`}><Icon name={stat.icon} className="h-[17px] w-[17px]" /></span></div>
                        <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">{stat.value.toLocaleString()}</p>
                        <p className="mt-2 text-xs"><span className={stat.tone === "warm" ? "font-semibold text-[#95611d]" : "font-semibold text-[#00696b]"}>{stat.change}</span><span className="ml-1.5 text-[#75777e]">{stat.note}</span></p>
                    </article>
                ))}
            </section>

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
                <section>
                    <SectionHeading eyebrow="Your day at a glance" title="Recent activity" link="#activity" />
                    <div id="activity" className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
                        {recentActivities.length === 0 ? <p className="px-5 py-6 text-sm text-[#75777e] sm:px-6">No recent activity.</p> : recentActivities.map((item, index) => (
                            <div key={item.id} className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${index < recentActivities.length - 1 ? "border-b border-[#eef0f1]" : ""}`}>
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d9f4f3] text-[#00696b]"><Icon name={item.icon} className="h-[17px] w-[17px]" /></span>
                                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#191c1d]">{item.title}</p><p className="mt-1 truncate text-xs text-[#75777e]">{item.detail}</p></div>
                                <time className="shrink-0 text-xs text-[#75777e]">{formatRelativeTime(item.createdAt)}</time>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionHeading eyebrow="Keep things moving" title="Pending actions" />
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-5">
                        <div className="space-y-4">
                            {pendingActions.map(([label, detail, icon]) => <Link href="#" key={label} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f3f4f5]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f3f4f5] text-[#00696b]"><Icon name={icon} className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#191c1d]">{label}</span><span className="mt-0.5 block text-xs text-[#75777e]">{detail}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-[#75777e]" /></Link>)}
                        </div>
                    </div>
                </section>
            </div>

            <section className="mt-10"><SectionHeading eyebrow="Quick access" title="Common actions" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map((action) => <Link href={action.href} key={action.label} className="group flex items-center gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#9edbda] hover:shadow-[0_8px_24px_rgba(0,105,107,0.08)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d9f4f3] text-[#00696b]"><Icon name={action.icon} className="h-[17px] w-[17px]" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#191c1d]">{action.label}</span><span className="mt-1 block text-xs text-[#75777e]">{action.description}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-[#75777e] transition group-hover:translate-x-0.5" /></Link>)}</div></section>

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.9fr)]">
                <section className="min-w-0"><SectionHeading eyebrow="Listing pulse" title="Recent properties" link="/properties" /><div className="overflow-x-auto rounded-2xl border border-[#e1e3e4] bg-white"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-[#eef0f1] text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]"><th className="px-5 py-4 font-bold">Property</th><th className="px-3 py-4 font-bold">Location</th><th className="px-3 py-4 font-bold">Status</th><th className="px-5 py-4 text-right font-bold">Added</th></tr></thead><tbody>{recentProperties.length === 0 ? <tr><td colSpan={4} className="px-5 py-6 text-sm text-[#75777e]">No property data available yet.</td></tr> : recentProperties.map((property) => <tr key={property.name} className="border-b border-[#eef0f1] last:border-0"><td className="px-5 py-4"><p className="text-sm font-semibold text-[#191c1d]">{property.name}</p><p className="mt-1 text-xs text-[#75777e]">{property.owner}</p></td><td className="px-3 py-4 text-sm text-[#44474d]">{property.location}</td><td className="px-3 py-4"><Status>{property.status}</Status></td><td className="px-5 py-4 text-right text-xs text-[#75777e]">{property.date}</td></tr>)}</tbody></table></div></section>
                <section className="min-w-0"><SectionHeading eyebrow="New this week" title="Recent users" link="/users" /><div className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">{recentUsers.length === 0 ? <p className="px-5 py-6 text-sm text-[#75777e]">No users found.</p> : recentUsers.map((user, index) => <div key={user.id} className={`flex items-center gap-3 px-5 py-4 ${index < recentUsers.length - 1 ? "border-b border-[#eef0f1]" : ""}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${getUserColor(user)}`}>{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#191c1d]">{user.name}</p><p className="mt-1 truncate text-xs text-[#75777e]">{user.email}</p></div><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-[#44474d]">{getUserRole(user)}</p><p className="mt-1 text-[11px] text-[#75777e]">{formatDate(user.createdAt)}</p></div><Status>{user.isVerified && user.status === "active" ? "Active" : "Pending"}</Status></div>)}</div></section>
            </div>
        </div>
    );
}
