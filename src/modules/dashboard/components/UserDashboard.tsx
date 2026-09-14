"use client";

import { useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import DashboardShell, { Icon, type IconName } from "./DashboardShell";
import { useAppSelector } from "@/src/store/hook";

interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: IconName;
    accent?: boolean;
}

const quickActions: QuickAction[] = [
    { label: "Find Properties", description: "Browse verified rental listings", href: "/properties", icon: "search" },
    { label: "My Requests", description: "Track rental & viewing requests", href: "/bookings", icon: "inbox" },
    { label: "My Rental", description: "View your current lease details", href: "#rental", icon: "home" },
    { label: "Pay Rent", description: "Manage dues & payment methods", href: "#payments", icon: "clock", accent: true },
];

const recommendedProperties = [
    {
        id: "rec-1",
        title: "Skyline Residences, 12B",
        location: "Koramangala, Bangalore",
        price: "₹45,000/mo",
        beds: 2,
        baths: 2,
        area: "1,200 sqft",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
        tag: "Verified",
    },
    {
        id: "rec-2",
        title: "Greenfield Penthouse",
        location: "Whitefield, Bangalore",
        price: "₹65,000/mo",
        beds: 3,
        baths: 3,
        area: "1,850 sqft",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
        tag: "Premium",
    },
];

export default function UserDashboard() {
    const user = useAppSelector((state) => state.auth.user);

    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);
    const [issueCategory, setIssueCategory] = useState("Plumbing");
    const [issueTitle, setIssueTitle] = useState("");
    const [issueDescription, setIssueDescription] = useState("");

    // Dynamic Time-of-Day Greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const userName = useMemo(() => {
        if (user?.name) return user.name;
        if (user?.email) {
            const handle = user.email.split("@")[0];
            return handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : "Tenant";
        }
        return "Tenant";
    }, [user]);

    const handleReportSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMaintenanceSuccess(true);
        setTimeout(() => {
            setMaintenanceSuccess(false);
            setIsMaintenanceModalOpen(false);
            setIssueTitle("");
            setIssueDescription("");
        }, 1800);
    };

    return (
        <DashboardShell role="user">
            <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                {/* Header Greeting */}
                <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00696b]">
                            Tenant Dashboard
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
                            {greeting}, {userName}
                        </h1>
                        <p className="mt-2 text-base text-[#44474d]">
                            Here&apos;s what&apos;s happening with your home today.
                        </p>
                    </div>

                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51] active:scale-[0.99]"
                    >
                        <Icon name="search" className="h-4 w-4" />
                        <span>Find a Property</span>
                    </Link>
                </section>

                {/* Summary Bento Cards (4 Cards) */}
                <section
                    className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    aria-label="Overview statistics"
                >
                    {/* Card 1: Current Rental */}
                    <article className="group relative overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs transition hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#d9f4f3] opacity-60 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#75777e]">
                                    Current Rental
                                </p>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#191c1d]">
                                    No active lease
                                </h2>
                            </div>
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d9f4f3] text-[#00696b]">
                                <Icon name="home" className="h-5 w-5" />
                            </span>
                        </div>
                        <p className="relative z-10 mt-4 text-xs font-medium text-[#75777e]">
                            Browse listings to request a home
                        </p>
                    </article>

                    {/* Card 2: Pending Requests */}
                    <article className="group relative overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs transition hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#56f5f8] opacity-20 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#75777e]">
                                    Pending Requests
                                </p>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#191c1d]">
                                    0
                                </h2>
                            </div>
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#56f5f8]/30 text-[#006e70]">
                                <Icon name="inbox" className="h-5 w-5" />
                            </span>
                        </div>
                        <Link
                            href="/bookings"
                            className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00696b] hover:text-[#004f51]"
                        >
                            View all requests <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </article>

                    {/* Card 3: Upcoming Payment */}
                    <article className="group relative overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs transition hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#d6e3ff] opacity-60 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#75777e]">
                                    Upcoming Payment
                                </p>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#191c1d]">
                                    No dues
                                </h2>
                            </div>
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6e3ff] text-[#0d1c32]">
                                <Icon name="clock" className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="relative z-10 mt-4">
                            <span className="inline-flex items-center rounded-full bg-[#d9f4f3] px-2.5 py-0.5 text-[11px] font-bold text-[#00696b]">
                                &bull; All paid
                            </span>
                        </div>
                    </article>

                    {/* Card 4: Maintenance */}
                    <article className="group relative overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs transition hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#ffdad6] opacity-40 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#75777e]">
                                    Maintenance
                                </p>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#191c1d]">
                                    0 open
                                </h2>
                            </div>
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e1e3e4] text-[#44474d]">
                                <Icon name="alert" className="h-5 w-5" />
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsMaintenanceModalOpen(true)}
                            className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00696b] hover:text-[#004f51]"
                        >
                            Report an issue <span aria-hidden="true">+</span>
                        </button>
                    </article>
                </section>

                {/* Main 2-Column Section */}
                <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column (2 Cols on lg): Active Rental & Recent Activity */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Current Rental Section */}
                        <section id="rental" className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#eef0f1] pb-4">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                                        Current Rental
                                    </h2>
                                    <p className="text-xs text-[#75777e]">
                                        Your active lease, landlord contact, and property specifications
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#f3f4f5] px-3 py-1 text-xs font-semibold text-[#75777e]">
                                    Inactive
                                </span>
                            </div>

                            {/* Empty State */}
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f8f9fa] text-[#00696b]">
                                    <Icon name="home" className="h-8 w-8" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-[#191c1d]">
                                    You don&apos;t have an active rental yet
                                </h3>
                                <p className="mt-1.5 max-w-md text-sm text-[#75777e]">
                                    Once your rental application is approved by a property owner, your lease details, agreement copy, and rent schedule will be managed right here.
                                </p>
                                <Link
                                    href="/properties"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                                >
                                    Browse Available Properties
                                </Link>
                            </div>
                        </section>

                        {/* Recent Activity Timeline */}
                        <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#eef0f1] pb-4">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                                        Recent Activity
                                    </h2>
                                    <p className="text-xs text-[#75777e]">
                                        Updates regarding requests, viewings, and payments
                                    </p>
                                </div>
                            </div>

                            {/* Empty State */}
                            <div className="py-10 text-center">
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f3f4f5] text-[#75777e]">
                                    <Icon name="clock" className="h-6 w-6" />
                                </div>
                                <p className="mt-3 text-sm font-semibold text-[#191c1d]">No recent activity</p>
                                <p className="mt-1 text-xs text-[#75777e]">
                                    Your property requests, payment receipts, and maintenance tickets will be logged here.
                                </p>
                            </div>
                        </section>

                        {/* Recommended Properties Grid */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                                        Recommended for You
                                    </h2>
                                    <p className="text-xs text-[#75777e]">
                                        Curated premium properties open for rental requests
                                    </p>
                                </div>
                                <Link
                                    href="/properties"
                                    className="text-xs font-bold text-[#00696b] hover:text-[#004f51]"
                                >
                                    View all properties &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {recommendedProperties.map((prop) => (
                                    <article
                                        key={prop.id}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-xs transition hover:shadow-md"
                                    >
                                        <div className="relative h-44 w-full overflow-hidden bg-[#f3f4f5]">
                                            <img
                                                src={prop.image}
                                                alt={prop.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                                                {prop.tag}
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-bold text-[#191c1d] group-hover:text-[#00696b]">
                                                    {prop.title}
                                                </h3>
                                                <span className="text-sm font-bold text-[#00696b] shrink-0">
                                                    {prop.price}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-[#75777e]">{prop.location}</p>
                                            <div className="mt-4 flex items-center gap-4 border-t border-[#f3f4f5] pt-3 text-[11px] font-medium text-[#44474d]">
                                                <span>{prop.beds} Beds</span>
                                                <span>&bull;</span>
                                                <span>{prop.baths} Baths</span>
                                                <span>&bull;</span>
                                                <span>{prop.area}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (1 Col on lg): Quick Actions, Payments, Maintenance */}
                    <div className="space-y-8">
                        {/* Quick Actions Card */}
                        <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                            <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                                Quick Actions
                            </h2>
                            <p className="text-xs text-[#75777e] mb-5">
                                Common tasks and portal navigation
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className={`flex flex-col items-center justify-center rounded-xl p-4 text-center transition ${
                                            action.accent
                                                ? "bg-[#00696b] text-white hover:bg-[#004f51] shadow-xs"
                                                : "bg-[#f8f9fa] text-[#191c1d] hover:bg-[#f3f4f5] border border-transparent hover:border-[#e1e3e4]"
                                        }`}
                                    >
                                        <span className="mb-2">
                                            <Icon name={action.icon} className="h-5 w-5" />
                                        </span>
                                        <span className="text-xs font-bold leading-tight">
                                            {action.label}
                                        </span>
                                    </Link>
                                ))}

                                {/* Full-width Report Maintenance button */}
                                <button
                                    type="button"
                                    onClick={() => setIsMaintenanceModalOpen(true)}
                                    className="col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl border border-[#00696b] p-3 text-xs font-bold text-[#00696b] transition hover:bg-[#d9f4f3]"
                                >
                                    <Icon name="alert" className="h-4 w-4" />
                                    <span>Report Maintenance Issue</span>
                                </button>
                            </div>
                        </section>

                        {/* Upcoming Payments Card */}
                        <section id="payments" className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#eef0f1] pb-4">
                                <h2 className="text-base font-bold tracking-tight text-[#191c1d]">
                                    Upcoming Payments
                                </h2>
                                <span className="text-[11px] font-semibold text-[#00696b]">
                                    Rentora Billing
                                </span>
                            </div>

                            <div className="py-6 text-center">
                                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#d9f4f3] text-[#00696b]">
                                    <Icon name="check" className="h-5 w-5" />
                                </div>
                                <p className="mt-3 text-sm font-bold text-[#191c1d]">No pending payments</p>
                                <p className="mt-1 text-xs text-[#75777e]">
                                    Rent invoices and payment receipts will appear here once your rental lease is activated.
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#f8f9fa] p-3 text-[11px] text-[#75777e]">
                                <span className="font-semibold text-[#191c1d]">Payment Security:</span> SpotNest uses end-to-end encrypted payment processing.
                            </div>
                        </section>

                        {/* Maintenance Summary Card */}
                        <section id="maintenance" className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#eef0f1] pb-4">
                                <h2 className="text-base font-bold tracking-tight text-[#191c1d]">
                                    Maintenance &amp; Repairs
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsMaintenanceModalOpen(true)}
                                    className="text-xs font-bold text-[#00696b] hover:text-[#004f51]"
                                >
                                    + Report
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-xl bg-[#f8f9fa] p-3">
                                    <span className="block text-lg font-bold text-[#191c1d]">0</span>
                                    <span className="text-[10px] font-semibold text-[#75777e] uppercase">Open</span>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fa] p-3">
                                    <span className="block text-lg font-bold text-[#191c1d]">0</span>
                                    <span className="text-[10px] font-semibold text-[#75777e] uppercase">In Progress</span>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fa] p-3">
                                    <span className="block text-lg font-bold text-[#00696b]">0</span>
                                    <span className="text-[10px] font-semibold text-[#75777e] uppercase">Resolved</span>
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-[#75777e] text-center">
                                Have an urgent repair? Our property owners respond within 24 hours.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Maintenance Report Modal */}
            {isMaintenanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eef0f1] pb-3">
                            <h3 className="text-lg font-bold text-[#191c1d]">
                                Report Maintenance Issue
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsMaintenanceModalOpen(false)}
                                className="rounded-full p-1 text-[#75777e] hover:bg-[#f3f4f5]"
                            >
                                <Icon name="close" className="h-5 w-5" />
                            </button>
                        </div>

                        {maintenanceSuccess ? (
                            <div className="py-8 text-center">
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#d9f4f3] text-[#00696b]">
                                    <Icon name="check" className="h-6 w-6" />
                                </div>
                                <h4 className="mt-3 text-base font-bold text-[#191c1d]">Request Submitted</h4>
                                <p className="mt-1 text-xs text-[#75777e]">
                                    Your maintenance request has been recorded and will be addressed shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#191c1d] mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={issueCategory}
                                        onChange={(e) => setIssueCategory(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-[#e1e3e4] bg-white px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    >
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                        <option>HVAC / AC</option>
                                        <option>Carpentry</option>
                                        <option>Appliance</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#191c1d] mb-1">
                                        Issue Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={issueTitle}
                                        onChange={(e) => setIssueTitle(e.target.value)}
                                        placeholder="e.g., Kitchen sink leaking"
                                        className="h-10 w-full rounded-xl border border-[#e1e3e4] bg-white px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#191c1d] mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={issueDescription}
                                        onChange={(e) => setIssueDescription(e.target.value)}
                                        placeholder="Describe the issue and where it is located..."
                                        className="w-full rounded-xl border border-[#e1e3e4] bg-white p-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMaintenanceModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-[#44474d] hover:bg-[#f3f4f5]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#00696b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004f51]"
                                    >
                                        Submit Ticket
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}