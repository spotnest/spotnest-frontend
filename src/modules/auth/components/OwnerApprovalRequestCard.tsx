"use client";

import { useEffect, useState } from "react";
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
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);

    useEffect(() => {
        if (!isDocumentOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsDocumentOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isDocumentOpen]);

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
                            <span className="rounded-full bg-[#eef0f1] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#44474d]">Owner / Agent</span>
                            <span className="rounded-full bg-[#fff0dc] px-2.5 py-1 text-[11px] font-bold text-[#95611d]">Pending approval</span>
                        </div>
                    </div>
                </div>

                <dl className="grid shrink-0 gap-1 text-xs text-[#75777e] sm:text-right">
                    <div><dt className="inline font-semibold text-[#44474d]">Requested: </dt><dd className="inline">{formatDate(request.submittedAt ?? request.createdAt)}</dd></div>
                    <div><dt className="inline font-semibold text-[#44474d]">Account created: </dt><dd className="inline">{formatDate(request.createdAt)}</dd></div>
                </dl>
            </div>

            <section className="mt-5 border-t border-[#eef0f1] pt-5" aria-label="Verification document">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#75777e]">Verification document</h3>
                {request.documentUrl ? (
                    <button
                        type="button"
                        onClick={() => setIsDocumentOpen(true)}
                        aria-label="Open verification document preview"
                        className="mt-3 flex items-center gap-3 rounded-xl border border-[#e1e3e4] p-2 text-left transition hover:border-[#00696b] hover:bg-[#f7fbfb] focus:outline-none focus:ring-2 focus:ring-[#d9f4f3]"
                    >
                        {request.documentFormat === "pdf" ? (
                            <span className="grid h-20 w-24 shrink-0 place-items-center rounded-lg bg-[#fff0ee] text-sm font-bold text-[#b42318]">PDF</span>
                        ) : (
                            <img src={request.documentUrl} alt="Uploaded verification document" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                        )}
                        <span className="text-sm font-semibold text-[#00696b]">Click to preview</span>
                    </button>
                ) : (
                    <p className="mt-3 rounded-xl bg-[#f3f4f5] px-4 py-3 text-sm text-[#75777e]">No document submitted</p>
                )}
            </section>

            {isDocumentOpen && request.documentUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Verification document preview"
                    onClick={(event) => { if (event.target === event.currentTarget) setIsDocumentOpen(false); }}
                >
                    <div className="relative max-h-[90vh] w-full max-w-5xl rounded-2xl bg-white p-3 shadow-2xl sm:p-5">
                        <button type="button" onClick={() => setIsDocumentOpen(false)} className="absolute right-3 top-3 z-10 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#191c1d] shadow hover:bg-[#f3f4f5]" aria-label="Close preview">Close</button>
                        {request.documentFormat === "pdf" ? (
                            <iframe src={request.documentUrl} title={`${request.name}'s verification document`} className="h-[80vh] w-full rounded-xl" />
                        ) : (
                            <img src={request.documentUrl} alt={`${request.name}'s verification document`} className="mx-auto max-h-[80vh] max-w-full rounded-xl object-contain" />
                        )}
                    </div>
                </div>
            )}

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
