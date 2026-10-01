"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    createVisit,
    getMyVisits,
} from "@/src/modules/visits/services/visitService";
import { useAppSelector } from "@/src/store/hook";

interface VisitRequestButtonProps {
    propertyId: string;
}

export default function VisitRequestButton({
    propertyId,
}: VisitRequestButtonProps) {
    const router = useRouter();

    const user = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );
    const isInitialized = useAppSelector(
        (state) => state.auth.isInitialized
    );

    const [isOpen, setIsOpen] = useState(false);
    const [requestedDate, setRequestedDate] = useState("");
    const [requestedTime, setRequestedTime] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingRequest, setIsCheckingRequest] = useState(false);
    const [error, setError] = useState("");
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!isInitialized || !isAuthenticated || !user) {
            return;
        }

        let cancelled = false;

        const checkExistingRequest = async () => {
            setIsCheckingRequest(true);

            try {
                const visits = await getMyVisits();

                if (cancelled) {
                    return;
                }

                const hasPendingRequest = visits.some(
                    (visit) =>
                        visit.property === propertyId &&
                        visit.status === "pending"
                );

                setIsPending(hasPendingRequest);
            } catch {
                if (!cancelled) {
                    setIsPending(false);
                }
            } finally {
                if (!cancelled) {
                    setIsCheckingRequest(false);
                }
            }
        };

        void checkExistingRequest();

        return () => {
            cancelled = true;
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
            await createVisit({
                propertyId,
                requestedDate,
                requestedTime,
                ...(message.trim()
                    ? { message: message.trim() }
                    : {}),
            });

            setIsPending(true);
            setIsOpen(false);
            setRequestedDate("");
            setRequestedTime("");
            setMessage("");
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                "Unable to send the visit request. Please try again.";

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingRequest) {
        return (
            <div className="mt-6 w-full rounded-lg border border-[#e1e3e4] bg-[#f8f9fa] px-4 py-3 text-center">
                <p className="text-sm text-[#75777e]">
                    Checking visit requests...
                </p>
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="mt-6 w-full rounded-lg border border-[#00696b] bg-[#f0fafa] px-4 py-3 text-center">
                <p className="text-sm font-semibold text-[#00696b]">
                    Visit request pending
                </p>

                <p className="mt-1 text-xs text-[#75777e]">
                    Waiting for the property owner to respond.
                </p>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => {
                    setError("");

                    if (!isInitialized || !isAuthenticated || !user) {
                        router.push("/login");
                        return;
                    }

                    setIsOpen(true);
                }}
                className="mt-6 w-full rounded-lg bg-[#00696b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
            >
                Visit
            </button>
        );
    }

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
                        setRequestedDate(event.target.value)
                    }
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
                        setRequestedTime(event.target.value)
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
                        setMessage(event.target.value)
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