import Link from "next/link";
import { Icon, type IconName } from "./DashboardShell";

const stats = [
    { label: "Total users", value: "2,486", change: "+12.8%", note: "vs. last month", icon: "users" as IconName, tone: "teal" },
    { label: "Total properties", value: "684", change: "+8.4%", note: "vs. last month", icon: "home" as IconName, tone: "ink" },
    { label: "Active listings", value: "528", change: "+6.2%", note: "vs. last month", icon: "chart" as IconName, tone: "teal" },
    { label: "Pending requests", value: "38", change: "Needs review", note: "across 12 owners", icon: "inbox" as IconName, tone: "warm" },
];

const activity = [
    { title: "New user registration", detail: "Nadia Thomas created an account", time: "8 min ago", icon: "users" as IconName, tone: "teal" },
    { title: "Property submitted", detail: "Harbor View Apartment is ready for review", time: "24 min ago", icon: "home" as IconName, tone: "sand" },
    { title: "Property approved", detail: "Greenfield Residence is now live", time: "1 hr ago", icon: "check" as IconName, tone: "teal" },
    { title: "New request received", detail: "Rahul Menon requested a viewing", time: "2 hrs ago", icon: "inbox" as IconName, tone: "ink" },
];

const properties = [
    { name: "Harbor View Apartment", owner: "Arjun Nair", location: "Kochi, Kerala", status: "Pending", date: "Sep 11, 2026" },
    { name: "Greenfield Residence", owner: "Maya Joseph", location: "Calicut, Kerala", status: "Live", date: "Sep 10, 2026" },
    { name: "Palm Grove Villa", owner: "Riya Thomas", location: "Thrissur, Kerala", status: "Live", date: "Sep 09, 2026" },
    { name: "Riverside 2BHK", owner: "Vishnu Raj", location: "Kochi, Kerala", status: "Review", date: "Sep 08, 2026" },
];

const users = [
    { initials: "NT", name: "Nadia Thomas", email: "nadia.t@example.com", role: "Renter", status: "Active", date: "Sep 11, 2026", color: "bg-[#d9f4f3] text-[#00696b]" },
    { initials: "AM", name: "Arjun Menon", email: "arjun.m@example.com", role: "Owner", status: "Active", date: "Sep 10, 2026", color: "bg-[#e8e4fb] text-[#4c3a9e]" },
    { initials: "SK", name: "Sara Khan", email: "sara.k@example.com", role: "Renter", status: "Pending", date: "Sep 09, 2026", color: "bg-[#f8e9d6] text-[#8a5a20]" },
];

const actions = [
    { label: "Add property", description: "Create a new listing", href: "/properties", icon: "plus" as IconName },
    { label: "Manage users", description: "View all accounts", href: "/users", icon: "users" as IconName },
    { label: "Review requests", description: "8 need attention", href: "/bookings", icon: "inbox" as IconName },
    { label: "View reports", description: "Track platform health", href: "/dashboard#reports", icon: "chart" as IconName },
];

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
    return (
        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">Friday, September 11, 2026</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-[38px]">Good morning, Amina.</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#44474d] sm:text-base">Here&apos;s what&apos;s happening across SpotNest today.</p>
                </div>
                <Link href="/properties" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,105,107,0.15)] transition hover:bg-[#004f51]"><Icon name="plus" className="h-4 w-4" /> Add property</Link>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform statistics">
                {stats.map((stat) => (
                    <article key={stat.label} className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.035)]">
                        <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-[#44474d]">{stat.label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${stat.tone === "teal" ? "bg-[#d9f4f3] text-[#00696b]" : stat.tone === "warm" ? "bg-[#fff0dc] text-[#95611d]" : "bg-[#eef0f1] text-[#191c1d]"}`}><Icon name={stat.icon} className="h-[17px] w-[17px]" /></span></div>
                        <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">{stat.value}</p>
                        <p className="mt-2 text-xs"><span className={stat.tone === "warm" ? "font-semibold text-[#95611d]" : "font-semibold text-[#00696b]"}>{stat.change}</span><span className="ml-1.5 text-[#75777e]">{stat.note}</span></p>
                    </article>
                ))}
            </section>

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
                <section>
                    <SectionHeading eyebrow="Your day at a glance" title="Recent activity" link="#activity" />
                    <div id="activity" className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
                        {activity.map((item, index) => (
                            <div key={item.title} className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${index < activity.length - 1 ? "border-b border-[#eef0f1]" : ""}`}>
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.tone === "teal" ? "bg-[#d9f4f3] text-[#00696b]" : item.tone === "sand" ? "bg-[#fff0dc] text-[#95611d]" : "bg-[#eef0f1] text-[#44474d]"}`}><Icon name={item.icon} className="h-[17px] w-[17px]" /></span>
                                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#191c1d]">{item.title}</p><p className="mt-1 truncate text-xs text-[#75777e]">{item.detail}</p></div>
                                <time className="shrink-0 text-xs text-[#75777e]">{item.time}</time>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionHeading eyebrow="Keep things moving" title="Pending actions" />
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-5">
                        <div className="space-y-4">
                            {[
                                ["Properties waiting for approval", "12 properties", "home" as IconName],
                                ["Requests to review", "8 new requests", "inbox" as IconName],
                                ["User verification", "5 accounts", "users" as IconName],
                                ["Reports requiring review", "3 open reports", "alert" as IconName],
                            ].map(([label, detail, icon]) => <Link href="#" key={label as string} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f3f4f5]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f3f4f5] text-[#00696b]"><Icon name={icon as IconName} className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#191c1d]">{label as string}</span><span className="mt-0.5 block text-xs text-[#75777e]">{detail as string}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-[#75777e]" /></Link>)}
                        </div>
                    </div>
                </section>
            </div>

            <section className="mt-10"><SectionHeading eyebrow="Quick access" title="Common actions" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map((action) => <Link href={action.href} key={action.label} className="group flex items-center gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#9edbda] hover:shadow-[0_8px_24px_rgba(0,105,107,0.08)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d9f4f3] text-[#00696b]"><Icon name={action.icon} className="h-[17px] w-[17px]" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#191c1d]">{action.label}</span><span className="mt-1 block text-xs text-[#75777e]">{action.description}</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-[#75777e] transition group-hover:translate-x-0.5" /></Link>)}</div></section>

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.9fr)]">
                <section className="min-w-0"><SectionHeading eyebrow="Listing pulse" title="Recent properties" link="/properties" /><div className="overflow-x-auto rounded-2xl border border-[#e1e3e4] bg-white"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-[#eef0f1] text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]"><th className="px-5 py-4 font-bold">Property</th><th className="px-3 py-4 font-bold">Location</th><th className="px-3 py-4 font-bold">Status</th><th className="px-5 py-4 text-right font-bold">Added</th></tr></thead><tbody>{properties.map((property) => <tr key={property.name} className="border-b border-[#eef0f1] last:border-0"><td className="px-5 py-4"><p className="text-sm font-semibold text-[#191c1d]">{property.name}</p><p className="mt-1 text-xs text-[#75777e]">{property.owner}</p></td><td className="px-3 py-4 text-sm text-[#44474d]">{property.location}</td><td className="px-3 py-4"><Status>{property.status}</Status></td><td className="px-5 py-4 text-right text-xs text-[#75777e]">{property.date}</td></tr>)}</tbody></table></div></section>
                <section className="min-w-0"><SectionHeading eyebrow="New this week" title="Recent users" link="/users" /><div className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">{users.map((user, index) => <div key={user.email} className={`flex items-center gap-3 px-5 py-4 ${index < users.length - 1 ? "border-b border-[#eef0f1]" : ""}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${user.color}`}>{user.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#191c1d]">{user.name}</p><p className="mt-1 truncate text-xs text-[#75777e]">{user.email}</p></div><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-[#44474d]">{user.role}</p><p className="mt-1 text-[11px] text-[#75777e]">{user.date}</p></div><Status>{user.status}</Status></div>)}</div></section>
            </div>
        </div>
    );
}
