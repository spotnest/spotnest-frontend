import React from "react";
import type { MaintenanceStatus } from "../types/maintenance";
import { STATUS_LABELS } from "../constants/maintenance";

interface StatusBadgeProps {
    status: MaintenanceStatus;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status, className = "" }) => {
    switch (status) {
        case "PENDING":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "ACCEPTED":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "SCHEDULED":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "IN_PROGRESS":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-700/10 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "COMPLETED":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "REJECTED":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        case "CANCELLED":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    {STATUS_LABELS[status]}
                </span>
            );
        default:
            return (
                <span
                    className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ${className}`}
                >
                    {status}
                </span>
            );
    }
};

export default StatusBadge;
