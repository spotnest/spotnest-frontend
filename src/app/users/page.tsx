"use client";

import { useQuery } from "@tanstack/react-query";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { getAdminUsers } from "@/src/modules/auth/services/authServices";
import type { AdminUser } from "@/src/modules/auth/types/auth";

function VerificationStatus({ user }: { user: AdminUser }) {
    if (user.role !== "owner") {
        return <span className="text-xs font-semibold text-[#75777e]">Not applicable</span>;
    }

    if (user.verificationStatus === "approved") {
        return <span className="inline-flex rounded-full bg-[#d9f4f3] px-2.5 py-1 text-xs font-bold text-[#00696b]">Approved</span>;
    }

    if (user.verificationStatus === "rejected") {
        return <span className="inline-flex rounded-full bg-[#fff0ee] px-2.5 py-1 text-xs font-bold text-[#b42318]">Rejected</span>;
    }

    return <span className="inline-flex rounded-full bg-[#fff0dc] px-2.5 py-1 text-xs font-bold text-[#95611d]">Pending Approval</span>;
}

export default function UsersPage() {
    const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getAdminUsers });

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Users</h1>
                <p className="mt-2 text-sm leading-6 text-[#44474d]">Manage platform accounts and view their verification status.</p>

                <section className="mt-8 overflow-x-auto rounded-2xl border border-[#e1e3e4] bg-white">
                    {usersQuery.isLoading ? (
                        <p className="px-5 py-8 text-sm text-[#75777e]">Loading users...</p>
                    ) : usersQuery.isError ? (
                        <p className="px-5 py-8 text-sm text-[#95611d]">Unable to load users.</p>
                    ) : (
                        <table className="w-full min-w-[760px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-[#eef0f1] text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]">
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-3 py-4">Email</th>
                                    <th className="px-3 py-4">Role</th>
                                    <th className="px-5 py-4">Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersQuery.data?.map((user) => (
                                    <tr key={user.id} className="border-b border-[#eef0f1] last:border-0">
                                        <td className="px-5 py-4 text-sm font-semibold text-[#191c1d]">{user.name}</td>
                                        <td className="px-3 py-4 text-sm text-[#44474d]">{user.email}</td>
                                        <td className="px-3 py-4 text-xs font-bold uppercase text-[#44474d]">{user.role}</td>
                                        <td className="px-5 py-4"><VerificationStatus user={user} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>
        </DashboardShell>
    );
}
