import React from "react";
import type { StatusHistoryItem } from "../types/maintenance";
import StatusBadge from "./StatusBadge";

interface StatusTimelineProps {
    history: StatusHistoryItem[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return <p className="text-sm text-slate-500 italic">No history records available.</p>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((item, idx) => {
                    const isLast = idx === history.length - 1;
                    return (
                        <li key={idx}>
                            <div className="relative pb-8">
                                {!isLast ? (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3 items-start">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#00696b]" />
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={item.newStatus} />
                                                <span className="text-xs text-slate-500 font-medium">
                                                    by {item.changedBy?.name || "User"}
                                                    {item.changedBy?.role ? ` (${item.changedBy.role})` : ""}
                                                </span>
                                            </div>
                                            {item.note ? (
                                                <p className="mt-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                                                    {item.note}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="whitespace-nowrap text-right text-xs text-slate-500">
                                            <time dateTime={item.timestamp}>
                                                {new Date(item.timestamp).toLocaleString()}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default StatusTimeline;
