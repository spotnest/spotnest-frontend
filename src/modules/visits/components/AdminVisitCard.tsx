"use client";

import type { AdminVisit } from "../services/visitService";

interface AdminVisitCardProps {
    visit: AdminVisit;
}

const statusStyles: Record<AdminVisit["status"], string> = {
    pending:
        "border-amber-200 bg-amber-50 text-amber-700",

    approved:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

    rejected:
        "border-red-200 bg-red-50 text-red-700",

    rescheduled:
        "border-blue-200 bg-blue-50 text-blue-700",

    cancelled:
        "border-gray-200 bg-gray-50 text-gray-700",

    completed:
        "border-teal-200 bg-teal-50 text-teal-700",
};

const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (time?: string) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");

    if (
        hours === undefined ||
        minutes === undefined
    ) {
        return time;
    }

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });
};

const formatUpdatedAt = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function AdminVisitCard({
    visit,
}: AdminVisitCardProps) {
    const address = visit.property?.address;

    const requester = visit.requester;
    const owner = visit.owner;

    return (
        <article className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#191c1d]">
                        {visit.property?.title ??
                            "Property unavailable"}
                    </h3>

                    {address ? (
                        <p className="mt-1 text-sm text-[#75777e]">
                            {address.street},{" "}
                            {address.city},{" "}
                            {address.state}{" "}
                            {address.zipCode}
                        </p>
                    ) : (
                        <p className="mt-1 text-sm text-[#75777e]">
                            Property information unavailable
                        </p>
                    )}
                </div>

                <span
                    className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                        statusStyles[visit.status]
                    }`}
                >
                    {visit.status}
                </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Requester
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                        {requester?.name ??
                            "User unavailable"}
                    </p>

                    <p className="text-sm text-[#75777e]">
                        {requester?.email ??
                            "Email unavailable"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Owner
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                        {owner?.name ??
                            "Owner unavailable"}
                    </p>

                    <p className="text-sm text-[#75777e]">
                        {owner?.email ??
                            "Email unavailable"}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#eef0f1] pt-5 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Requested
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                        {formatDate(
                            visit.requestedDate
                        )}
                    </p>

                    <p className="text-sm text-[#75777e]">
                        {formatTime(
                            visit.requestedTime
                        )}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Scheduled
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                        {formatDate(
                            visit.scheduledDate
                        )}
                    </p>

                    <p className="text-sm text-[#75777e]">
                        {formatTime(
                            visit.scheduledTime
                        )}
                    </p>
                </div>
            </div>

            {visit.message && (
                <div className="mt-5 rounded-xl bg-[#f8f9fa] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Message
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#44474d]">
                        {visit.message}
                    </p>
                </div>
            )}

            {visit.rejectionReason && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                        Rejection reason
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-red-700">
                        {visit.rejectionReason}
                    </p>
                </div>
            )}

            {visit.rescheduleReason && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Reschedule reason
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-blue-700">
                        {visit.rescheduleReason}
                    </p>
                </div>
            )}

            <div className="mt-5 border-t border-[#eef0f1] pt-4">
                <p className="text-xs text-[#75777e]">
                    Last updated:{" "}
                    <span className="font-medium text-[#44474d]">
                        {formatUpdatedAt(
                            visit.updated_at
                        )}
                    </span>
                </p>
            </div>
        </article>
    );
}