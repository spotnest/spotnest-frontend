"use client";

import { useState } from "react";
import type { OwnerApprovalRequest } from "../types/auth";

type Props = {
    request: OwnerApprovalRequest;
    isProcessing: boolean;
    onApprove: (userId: string) => void;
    onReject: (userId: string, reason: string) => void;
};

const formatDate = (value?: string) => {
    if (!value) return "Not available";
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

export default function OwnerApprovalRequestCard({ request, isProcessing, onApprove, onReject }: Props) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const initials = request.name
        .split(" ")
        .map((name) => name[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "O";

    const submitRejection = () => {
        const trimmedReason = reason.trim();
        if (!trimmedReason || isProcessing) return;
        onReject(request.id, trimmedReason);
    };

    return (
        <article className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d9f4f3] text-sm font-bold text-[#00696b]">
                        {initials}
                    </span>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-[#191c1d]">{request.name}</h2>
                        <p className="mt-0.5 truncate text-sm text-[#44474d]">{request.email}</p>
                        {request.phone && <p className="mt-1 text-xs text-[#75777e]">{request.phone}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#eef0f1] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#44474d]">Property Owner</span>
                            <span className="rounded-full bg-[#fff0dc] px-2.5 py-1 text-[11px] font-bold text-[#95611d]">Pending approval</span>
                        </div>
                    </div>
                </div>

                <dl className="grid shrink-0 gap-1 text-xs text-[#75777e] sm:text-right">
                    <div><dt className="inline font-semibold text-[#44474d]">Requested: </dt><dd className="inline">{formatDate(request.submittedAt ?? request.createdAt)}</dd></div>
                    <div><dt className="inline font-semibold text-[#44474d]">Account created: </dt><dd className="inline">{formatDate(request.createdAt)}</dd></div>
                </dl>
            </div>

            {isRejecting && (
                <div className="mt-5 border-t border-[#eef0f1] pt-5">
                    <label className="block text-xs font-bold uppercase tracking-[0.1em] text-[#75777e]" htmlFor={`reject-reason-${request.id}`}>Rejection reason</label>
                    <textarea id={`reject-reason-${request.id}`} value={reason} onChange={(event) => setReason(event.target.value)} disabled={isProcessing} maxLength={500} rows={3} placeholder="Explain what the owner needs to correct." className="mt-2 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3] disabled:cursor-not-allowed disabled:bg-[#f3f4f5]" />
                </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#eef0f1] pt-5 sm:flex-row sm:justify-end">
                {isRejecting ? (
                    <>
                        <button type="button" disabled={isProcessing} onClick={() => { setIsRejecting(false); setReason(""); }} className="rounded-xl border border-[#c5c6cd] px-4 py-2.5 text-sm font-bold text-[#44474d] transition hover:bg-[#f3f4f5] disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                        <button type="button" disabled={isProcessing || !reason.trim()} onClick={submitRejection} className="rounded-xl bg-[#b42318] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#8f1b13] disabled:cursor-not-allowed disabled:opacity-60">{isProcessing ? "Rejecting..." : "Confirm reject"}</button>
                    </>
                ) : (
                    <>
                        <button type="button" disabled={isProcessing} onClick={() => setIsRejecting(true)} className="rounded-xl border border-[#d92d20] px-4 py-2.5 text-sm font-bold text-[#b42318] transition hover:bg-[#fff0ee] disabled:cursor-not-allowed disabled:opacity-60">Reject</button>
                        <button type="button" disabled={isProcessing} onClick={() => onApprove(request.id)} className="rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60">{isProcessing ? "Approving..." : "Approve"}</button>
                    </>
                )}
            </div>
        </article>
    );
}
