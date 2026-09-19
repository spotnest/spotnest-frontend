import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import Link from "next/link";

export default function OwnerDashboardPage() {
    return (
        <DashboardShell role="owner">
            <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00696b]">
                            Owner Portal
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
                            Property Owner Dashboard
                        </h1>
                        <p className="mt-2 text-base text-[#44474d]">
                            Manage your listed properties, review tenant applications, and monitor rental earnings.
                        </p>
                    </div>

                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51]"
                    >
                        <span>Manage Properties</span>
                    </Link>
                </section>

                <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-8 text-center">
                    <p className="text-sm font-semibold text-[#191c1d]">Welcome to the Owner Portal</p>
                    <p className="mt-1 text-xs text-[#75777e]">
                        Use the sidebar to view properties, monitor tenant booking requests, and configure settings.
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}

