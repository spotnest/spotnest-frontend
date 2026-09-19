"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { approveOwner, getOwnerApprovalRequests } from "@/src/modules/auth/services/authServices";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

export default function OwnerApprovalRequestsPage() {
    const queryClient = useQueryClient();
    const [feedback, setFeedback] = useState("");
    const requestsQuery = useQuery({ queryKey: ["owner-approval-requests"], queryFn: getOwnerApprovalRequests });
    const approveMutation = useMutation({
        mutationFn: approveOwner,
        onSuccess: async () => {
            setFeedback("Owner approved successfully.");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["owner-approval-requests"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
            ]);
        },
    });

    return <DashboardShell role="admin"><main className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10"><header><p className="text-sm font-semibold text-[#00696b]">Requests</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Owner Approval Requests</h1><p className="mt-2 text-sm leading-6 text-[#44474d]">Review Owners waiting for approval before they can use Owner features.</p></header>{feedback && <p className="mt-6 rounded-lg bg-[#d9f4f3] px-4 py-3 text-sm font-semibold text-[#00696b]">{feedback}</p>}{requestsQuery.isError && <p className="mt-6 rounded-lg bg-[#fff0dc] px-4 py-3 text-sm font-semibold text-[#95611d]">Unable to load Owner approval requests.</p>}{requestsQuery.isLoading ? <p className="py-10 text-sm text-[#75777e]">Loading requests...</p> : requestsQuery.data?.length === 0 ? <section className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-8 text-center"><p className="text-sm font-semibold text-[#191c1d]">No pending Owner approvals</p><p className="mt-1 text-sm text-[#75777e]">New approval requests will appear here.</p></section> : <section className="mt-8 space-y-4">{requestsQuery.data?.map((request) => <article key={request.id} className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><h2 className="text-lg font-bold text-[#191c1d]">{request.name}</h2><p className="mt-1 text-sm text-[#44474d]">{request.email}</p><p className="mt-1 text-sm text-[#75777e]">{request.phone ?? "No phone provided"}</p></div><span className="inline-flex w-fit rounded-full bg-[#fff0dc] px-2.5 py-1 text-xs font-bold text-[#95611d]">Pending Approval</span></div><dl className="mt-5 grid gap-4 border-t border-[#eef0f1] pt-5 sm:grid-cols-3"><div><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]">Registered</dt><dd className="mt-1 text-sm text-[#191c1d]">{formatDate(request.createdAt)}</dd></div><div><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]">Account status</dt><dd className="mt-1 text-sm capitalize text-[#191c1d]">{request.status}</dd></div><div><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]">Verification</dt><dd className="mt-1 text-sm text-[#191c1d]">{request.verificationStatus ?? "Pending"}</dd></div></dl><div className="mt-5 flex justify-end gap-3"><Link href="/users" className="rounded-lg border border-[#c5c6cd] px-3.5 py-2 text-xs font-bold text-[#44474d] hover:bg-[#f3f4f5]">View</Link><button type="button" disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(request.id)} className="rounded-lg bg-[#00696b] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60">{approveMutation.isPending && approveMutation.variables === request.id ? "Approving..." : "Approve"}</button></div></article>)}</section>}</main></DashboardShell>;
}
