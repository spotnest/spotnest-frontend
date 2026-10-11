import React from "react";
import type { MaintenancePriority } from "../types/maintenance";

interface PriorityBadgeProps {
    priority: MaintenancePriority;
    className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
    switch (priority) {
        case "Emergency":
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 ring-2 ring-red-500/50 animate-pulse ${className}`}
                >
                    <svg className="h-3.5 w-3.5 fill-current text-red-600" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    EMERGENCY
                </span>
            );
        case "High":
            return (
                <span
                    className={`inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20 ${className}`}
                >
                    High
                </span>
            );
        case "Normal":
            return (
                <span
                    className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${className}`}
                >
                    Normal
                </span>
            );
        case "Low":
            return (
                <span
                    className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 ${className}`}
                >
                    Low
                </span>
            );
        default:
            return (
                <span className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ${className}`}>
                    {priority}
                </span>
            );
    }
};

export default PriorityBadge;
