"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    createVisit,
    getMyVisits,
} from "@/src/modules/visits/services/visitService";

import type {
    Visit,
    VisitStatus,
} from "@/src/modules/visits/services/visitService";

import { useAppSelector } from "@/src/store/hook";

interface VisitRequestButtonProps {
    propertyId: string;
}

const statusStyles: Record<VisitStatus, string> = {
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

const statusLabels: Record<VisitStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    rescheduled: "Rescheduled",
    cancelled: "Cancelled",
    completed: "Completed",
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

const getLatestVisit = (
    visits: Visit[],
    propertyId: string
): Visit | null => {
    const propertyVisits = visits.filter(
        (visit) =>
            visit.property === propertyId
    );

    if (propertyVisits.length === 0) {
        return null;
    }

    return [...propertyVisits].sort(
        (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
    )[0] ?? null;
};

export default function VisitRequestButton({
    propertyId,
}: VisitRequestButtonProps) {
    const router = useRouter();

    const user = useAppSelector(
        (state) => state.auth.user
    );

    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const isInitialized = useAppSelector(
        (state) => state.auth.isInitialized
    );

    const [isOpen, setIsOpen] = useState(false);

    const [requestedDate, setRequestedDate] =
        useState("");

    const [requestedTime, setRequestedTime] =
        useState("");

    const [message, setMessage] = useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isCheckingRequest, setIsCheckingRequest] =
        useState(false);

    const [error, setError] = useState("");

    const [latestVisit, setLatestVisit] =
        useState<Visit | null>(null);

    const loadVisits = async (
        showLoading = false
    ) => {
        if (
            !isInitialized ||
            !isAuthenticated ||
            !user
        ) {
            return;
        }

        if (showLoading) {
            setIsCheckingRequest(true);
        }

        try {
            const visits = await getMyVisits();

            const latest = getLatestVisit(
                visits,
                propertyId
            );

            setLatestVisit(latest);
        } catch {
            if (showLoading) {
                setLatestVisit(null);
            }
        } finally {
            if (showLoading) {
                setIsCheckingRequest(false);
            }
        }
    };

    useEffect(() => {
        if (
            !isInitialized ||
            !isAuthenticated ||
            !user
        ) {
            return;
        }

        let cancelled = false;

        const checkVisits = async () => {
            if (cancelled) {
                return;
            }

            setIsCheckingRequest(true);

            try {
                const visits = await getMyVisits();

                if (cancelled) {
                    return;
                }

                const latest = getLatestVisit(
                    visits,
                    propertyId
                );

                setLatestVisit(latest);
            } catch {
                if (!cancelled) {
                    setLatestVisit(null);
                }
            } finally {
                if (!cancelled) {
                    setIsCheckingRequest(false);
                }
            }
        };

        void checkVisits();

        const interval = window.setInterval(
            () => {
                void loadVisits(false);
            },
            10000
        );

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [
        isInitialized,
        isAuthenticated,
        user,
        propertyId,
    ]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const createdVisit =
                await createVisit({
                    propertyId,
                    requestedDate,
                    requestedTime,
                    ...(message.trim()
                        ? {
                              message:
                                  message.trim(),
                          }
                        : {}),
                });

            setLatestVisit(createdVisit);

            setIsOpen(false);
            setRequestedDate("");
            setRequestedTime("");
            setMessage("");
        } catch (err: unknown) {
            const errorMessage =
                (
                    err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    }
                )?.response?.data?.message ||
                "Unable to send the visit request. Please try again.";

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canRequestAgain =
        !latestVisit ||
        latestVisit.status === "rejected" ||
        latestVisit.status === "cancelled" ||
        latestVisit.status === "completed";

    if (isCheckingRequest) {
        return (
            <div className="mt-6 w-full rounded-lg border border-[#e1e3e4] bg-[#f8f9fa] px-4 py-3 text-center">
                <p className="text-sm text-[#75777e]">
                    Checking visit requests...
                </p>
            </div>
        );
    }

    /*
     * -----------------------------------------------------
     * EXISTING VISIT STATUS
     * -----------------------------------------------------
     */

    if (
        latestVisit &&
        !canRequestAgain
    ) {
        return (
            <div className="mt-6 w-full rounded-xl border border-[#e1e3e4] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-[#191c1d]">
                            Visit request
                        </p>

                        <p className="mt-1 text-xs text-[#75777e]">
                            Last updated{" "}
                            {formatDate(
                                latestVisit.updated_at
                            )}
                        </p>
                    </div>

                    <span
                        className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                            statusStyles[
                                latestVisit.status
                            ]
                        }`}
                    >
                        {
                            statusLabels[
                                latestVisit.status
                            ]
                        }
                    </span>
                </div>

                <div className="mt-4 rounded-lg bg-[#f8f9fa] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                        Requested
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                        {formatDate(
                            latestVisit.requestedDate
                        )}
                    </p>

                    <p className="text-sm text-[#75777e]">
                        {formatTime(
                            latestVisit.requestedTime
                        )}
                    </p>
                </div>

                {latestVisit.scheduledDate && (
                    <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Scheduled visit
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-800">
                            {formatDate(
                                latestVisit.scheduledDate
                            )}
                        </p>

                        <p className="text-sm text-emerald-700">
                            {formatTime(
                                latestVisit.scheduledTime
                            )}
                        </p>
                    </div>
                )}

                {latestVisit.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                            Rejection reason
                        </p>

                        <p className="mt-1 text-sm leading-5 text-red-700">
                            {
                                latestVisit.rejectionReason
                            }
                        </p>
                    </div>
                )}

                {latestVisit.rescheduleReason && (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Reschedule reason
                        </p>

                        <p className="mt-1 text-sm leading-5 text-blue-700">
                            {
                                latestVisit.rescheduleReason
                            }
                        </p>
                    </div>
                )}

                {latestVisit.message && (
                    <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                            Your message
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#44474d]">
                            {latestVisit.message}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    /*
     * -----------------------------------------------------
     * REQUEST AGAIN / VISIT BUTTON
     * -----------------------------------------------------
     */

    if (!isOpen) {
        return (
            <div className="mt-6">
                {latestVisit && (
                    <div className="mb-3 rounded-lg border border-[#e1e3e4] bg-[#f8f9fa] px-4 py-3">
                        <p className="text-sm font-semibold text-[#191c1d]">
                            Previous visit request
                        </p>

                        <p className="mt-1 text-sm text-[#75777e]">
                            Status:{" "}
                            <span className="font-semibold">
                                {
                                    statusLabels[
                                        latestVisit.status
                                    ]
                                }
                            </span>
                        </p>

                        {latestVisit.rejectionReason && (
                            <p className="mt-1 text-sm text-red-600">
                                {
                                    latestVisit.rejectionReason
                                }
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => {
                        setError("");

                        if (
                            !isInitialized ||
                            !isAuthenticated ||
                            !user
                        ) {
                            router.push("/login");
                            return;
                        }

                        setIsOpen(true);
                    }}
                    className="w-full rounded-lg bg-[#00696b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                >
                    {latestVisit
                        ? "Request Another Visit"
                        : "Visit"}
                </button>
            </div>
        );
    }

    /*
     * -----------------------------------------------------
     * CREATE VISIT FORM
     * -----------------------------------------------------
     */

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-xl border border-[#e1e3e4] bg-[#fafafa] p-4"
        >
            <div>
                <h3 className="text-base font-semibold text-[#191c1d]">
                    Request a Visit
                </h3>

                <p className="mt-1 text-sm text-[#75777e]">
                    Choose a preferred date and time.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor="visit-date"
                    className="mb-1.5 block text-sm font-medium text-[#191c1d]"
                >
                    Preferred date
                </label>

                <input
                    id="visit-date"
                    type="date"
                    value={requestedDate}
                    onChange={(event) =>
                        setRequestedDate(
                            event.target.value
                        )
                    }
                    min={new Date()
                        .toISOString()
                        .slice(0, 10)}
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#d5d7d8] bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#00696b] disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div>
                <label
                    htmlFor="visit-time"
                    className="mb-1.5 block text-sm font-medium text-[#191c1d]"
                >
                    Preferred time
                </label>

                <input
                    id="visit-time"
                    type="time"
                    value={requestedTime}
                    onChange={(event) =>
                        setRequestedTime(
                            event.target.value
                        )
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#d5d7d8] bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#00696b] disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div>
                <label
                    htmlFor="visit-message"
                    className="mb-1.5 block text-sm font-medium text-[#191c1d]"
                >
                    Message{" "}
                    <span className="font-normal text-[#75777e]">
                        (optional)
                    </span>
                </label>

                <textarea
                    id="visit-message"
                    value={message}
                    onChange={(event) =>
                        setMessage(
                            event.target.value
                        )
                    }
                    maxLength={1000}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Add any message for the property owner..."
                    className="w-full resize-none rounded-lg border border-[#d5d7d8] bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none placeholder:text-[#9a9ca1] focus:border-[#00696b] disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => {
                        setError("");
                        setIsOpen(false);
                    }}
                    disabled={isSubmitting}
                    className="w-1/2 rounded-lg border border-[#191c1d] px-4 py-2.5 text-sm font-semibold text-[#191c1d] transition hover:bg-[#191c1d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting
                        ? "Sending..."
                        : "Request Visit"}
                </button>
            </div>
        </form>
    );
}