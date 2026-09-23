"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import OwnerApprovalRequestCard from "@/src/modules/auth/components/OwnerApprovalRequestCard";
import { useOwnerApprovalRequests, ownerApprovalRequestsQueryKey } from "@/src/modules/auth/hooks/useOwnerApprovalRequests";
import { approveOwner, rejectOwner } from "@/src/modules/auth/services/authServices";
import { getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";
import { useAppSelector } from "@/src/store/hook";

const messageFromError = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : fallback;

export default function OwnerApprovalRequestsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isInitialized } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";
    const requestsQuery = useOwnerApprovalRequests(isInitialized && isAdmin);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isInitialized && user && !isAdmin) {
            router.replace(getDashboardRouteForRole(user.role));
        }
    }, [isAdmin, isInitialized, router, user]);

    const refreshApprovalData = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ownerApprovalRequestsQueryKey }),
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
            queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        ]);
    };

    const approveMutation = useMutation({
        mutationFn: approveOwner,
        onSuccess: async (data) => {
            setFeedback(data.message);
            setError("");
            await refreshApprovalData();
        },
        onError: (mutationError) => setError(messageFromError(mutationError, "Unable to approve this request.")),
        onSettled: () => setActiveRequestId(null),
    });

    const rejectMutation = useMutation({
        mutationFn: rejectOwner,
        onSuccess: async (data) => {
            setFeedback(data.message);
            setError("");
            await refreshApprovalData();
        },
        onError: (mutationError) => setError(messageFromError(mutationError, "Unable to reject this request.")),
        onSettled: () => setActiveRequestId(null),
    });

    const approveRequest = (userId: string) => {
        if (activeRequestId) return;
        setFeedback("");
        setError("");
        setActiveRequestId(userId);
        approveMutation.mutate(userId);
    };

    const rejectRequest = (userId: string, reason: string) => {
        if (activeRequestId) return;
        setFeedback("");
        setError("");
        setActiveRequestId(userId);
        rejectMutation.mutate({ userId, reason });
    };

    if (!isInitialized || !isAdmin) return null;

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Requests</h1>
                <p className="mt-2 text-sm leading-6 text-[#44474d]">Review Owner account approval requests.</p>

                {feedback && <p role="status" className="mt-6 rounded-xl border border-[#9bd9d6] bg-[#d9f4f3] px-4 py-3 text-sm font-semibold text-[#00696b]">{feedback}</p>}
                {error && <p role="alert" className="mt-6 rounded-xl border border-[#f0b5ae] bg-[#fff0ee] px-4 py-3 text-sm font-semibold text-[#b42318]">{error}</p>}

                <section className="mt-8" aria-label="Pending Owner approval requests">
                    {requestsQuery.isLoading ? (
                        <div className="rounded-2xl border border-[#e1e3e4] bg-white px-5 py-10 text-center text-sm text-[#75777e]">Loading approval requests...</div>
                    ) : requestsQuery.isError ? (
                        <div className="rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-sm text-[#b42318]">Unable to load approval requests. Please refresh and try again.</div>
                    ) : requestsQuery.data?.length ? (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {requestsQuery.data.map((request) => (
                                <OwnerApprovalRequestCard
                                    key={request.id}
                                    request={request}
                                    isProcessing={activeRequestId === request.id && (approveMutation.isPending || rejectMutation.isPending)}
                                    onApprove={approveRequest}
                                    onReject={rejectRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white px-5 py-12 text-center">
                            <p className="text-sm font-bold text-[#191c1d]">No pending approval requests.</p>
                            <p className="mt-1 text-sm text-[#75777e]">New Owner requests will appear here.</p>
                        </div>
                    )}
                </section>
            </main>
        </DashboardShell>
    );
}
