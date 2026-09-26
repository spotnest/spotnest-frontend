"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type {
    MaintenanceRequest,
    PaymentStatus,
    TenantPayment,
    TenantRental,
} from "../types/types";
import { useCreateMaintenance } from "../hooks/hooks";

export const money = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

export const date = (value?: string) =>
    value
        ? new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(value))
        : "—";

export const address = (
    value: TenantRental["property"]["address"]
) =>
    [
        value.street,
        value.city,
        value.state,
        value.zipCode,
        value.country,
    ]
        .filter(Boolean)
        .join(", ");

const statusColor: Record<string, string> = {
    paid: "bg-[#d9f4f3] text-[#00696b]",

    unpaid: "bg-[#fff3cd] text-[#765b00]",

    pending: "bg-[#fff3cd] text-[#765b00]",

    due: "bg-[#ffeadf] text-[#a03b00]",

    overdue: "bg-[#ffdad6] text-[#ba1a1a]",

    failed: "bg-[#ffdad6] text-[#ba1a1a]",

    active: "bg-[#d9f4f3] text-[#00696b]",

    pending_maintenance:
        "bg-[#fff3cd] text-[#765b00]",

    in_progress:
        "bg-[#dbeafe] text-[#1e4f91]",

    resolved:
        "bg-[#d9f4f3] text-[#00696b]",

    rejected:
        "bg-[#ffdad6] text-[#ba1a1a]",

    cancelled:
        "bg-[#f3f4f5] text-[#44474d]",
};

export function Status({
    value,
}: {
    value: string;
}) {
    return (
        <span
            className={`
                inline-flex
                rounded-full
                px-2.5
                py-1
                text-xs
                font-bold
                capitalize
                ${statusColor[value] ??
                "bg-[#f3f4f5] text-[#44474d]"
                }
            `}
        >
            {value.replaceAll("_", " ")}
        </span>
    );
}

export function Card({
    title,
    value,
    detail,
    children,
}: {
    title: string;
    value?: string;
    detail?: string;
    children?: ReactNode;
}) {
    return (
        <div
            className="
                rounded-2xl
                border
                border-[#e1e3e4]
                bg-white
                p-5
                shadow-xs
            "
        >
            <p
                className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[.08em]
                    text-[#75777e]
                "
            >
                {title}
            </p>

            {value && (
                <p
                    className="
                        mt-2
                        text-2xl
                        font-bold
                        text-[#191c1d]
                    "
                >
                    {value}
                </p>
            )}

            {detail && (
                <p
                    className="
                        mt-1
                        text-sm
                        text-[#75777e]
                    "
                >
                    {detail}
                </p>
            )}

            {children}
        </div>
    );
}

export function EmptyRental({
    title = "You don’t have an active rental yet",
}: {
    title?: string;
}) {
    return (
        <div
            className="
                rounded-2xl
                border
                border-dashed
                border-[#c5c6cd]
                bg-white
                px-6
                py-12
                text-center
            "
        >
            <h2
                className="
                    text-xl
                    font-bold
                    text-[#191c1d]
                "
            >
                {title}
            </h2>

            <p
                className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    text-[#75777e]
                "
            >
                When a rental is approved, its lease,
                payment and maintenance information
                will appear here.
            </p>

            <Link
                href="/properties"
                className="
                    mt-5
                    inline-flex
                    rounded-xl
                    bg-[#00696b]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    hover:bg-[#004f51]
                "
            >
                Browse properties
            </Link>
        </div>
    );
}

export function PageState({
    loading,
    error,
    children,
}: {
    loading: boolean;
    error: Error | null;
    children: ReactNode;
}) {
    if (loading) {
        return (
            <div className="p-6 lg:p-10">
                <div
                    className="
                        h-8
                        w-8
                        animate-spin
                        rounded-full
                        border-2
                        border-[#00696b]/30
                        border-t-[#00696b]
                    "
                />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="
                    m-6
                    rounded-xl
                    bg-[#ffdad6]
                    p-4
                    text-sm
                    text-[#ba1a1a]
                    lg:m-10
                "
            >
                Unable to load your tenant information.
                Please try again.
            </div>
        );
    }

    return <>{children}</>;
}

export function RentalHero({
    rental,
}: {
    rental: TenantRental;
}) {
    return (
        <section
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[#e1e3e4]
                bg-white
            "
        >
            <div
                className="
                    grid
                    md:grid-cols-[260px_1fr]
                "
            >
                <div
                    className="
                        relative
                        min-h-52
                        bg-[#e1e3e4]
                    "
                >
                    {rental.property.image ? (
                        <Image
                            src={rental.property.image}
                            alt={rental.property.title}
                            fill
                            className="object-cover"
                            sizes="
                                (max-width: 768px)
                                100vw,
                                260px
                            "
                        />
                    ) : (
                        <div
                            className="
                                grid
                                h-full
                                place-items-center
                                text-sm
                                text-[#75777e]
                            "
                        >
                            No property image
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div
                        className="
                            flex
                            flex-wrap
                            items-start
                            justify-between
                            gap-3
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[.08em]
                                    text-[#00696b]
                                "
                            >
                                My current rental
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {rental.property.title}
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-[#75777e]
                                "
                            >
                                {address(
                                    rental.property.address
                                )}
                            </p>
                        </div>

                        <Status value={rental.status} />
                    </div>

                    <dl
                        className="
                            mt-6
                            grid
                            gap-4
                            text-sm
                            sm:grid-cols-3
                        "
                    >
                        <div>
                            <dt className="text-[#75777e]">
                                Monthly rent
                            </dt>

                            <dd
                                className="
                                    mt-1
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {money(rental.monthlyRent)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-[#75777e]">
                                Lease ends
                            </dt>

                            <dd
                                className="
                                    mt-1
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {date(rental.leaseEnd)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-[#75777e]">
                                Owner
                            </dt>

                            <dd
                                className="
                                    mt-1
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {rental.owner.name}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </section>
    );
}

export function PaymentTable({
    payments,
}: {
    payments: TenantPayment[];
}) {
    if (!payments.length) {
        return (
            <p
                className="
                    p-6
                    text-sm
                    text-[#75777e]
                "
            >
                No payment records are available
                for this rental.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table
                className="
                    w-full
                    min-w-[720px]
                    text-left
                    text-sm
                "
            >
                <thead
                    className="
                        border-b
                        border-[#e1e3e4]
                        text-xs
                        uppercase
                        tracking-[.06em]
                        text-[#75777e]
                    "
                >
                    <tr>
                        <th className="px-5 py-3">
                            Type
                        </th>

                        <th className="px-5 py-3">
                            Amount
                        </th>

                        <th className="px-5 py-3">
                            Due / paid date
                        </th>

                        <th className="px-5 py-3">
                            Method / reference
                        </th>

                        <th className="px-5 py-3">
                            Status
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {payments.map((payment) => (
                        <tr
                            key={payment.id}
                            className="
                                border-b
                                border-[#eef0f1]
                                last:border-0
                            "
                        >
                            <td
                                className="
                                    px-5
                                    py-4
                                    font-semibold
                                    capitalize
                                    text-[#191c1d]
                                "
                            >
                                {payment.type.replaceAll(
                                    "_",
                                    " "
                                )}

                                {payment.lateFee > 0 && (
                                    <span
                                        className="
                                            block
                                            pt-1
                                            text-xs
                                            font-normal
                                            text-[#ba1a1a]
                                        "
                                    >
                                        Fine:{" "}
                                        {money(
                                            payment.lateFee
                                        )}
                                    </span>
                                )}
                            </td>

                            <td
                                className="
                                    px-5
                                    py-4
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {money(payment.amount)}
                            </td>

                            <td
                                className="
                                    px-5
                                    py-4
                                    text-[#44474d]
                                "
                            >
                                {payment.paidAt
                                    ? `Paid ${date(
                                        payment.paidAt
                                    )}`
                                    : `Due ${date(
                                        payment.dueDate
                                    )}`}
                            </td>

                            <td
                                className="
                                    px-5
                                    py-4
                                    text-[#44474d]
                                "
                            >
                                {payment.method ?? "—"}

                                {payment.referenceId && (
                                    <span
                                        className="
                                            block
                                            text-xs
                                            text-[#75777e]
                                        "
                                    >
                                        {payment.referenceId}
                                    </span>
                                )}
                            </td>

                            <td className="px-5 py-4">
                                <Status
                                    value={
                                        payment.status as PaymentStatus
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function MaintenanceForm() {
    const [title, setTitle] = useState("");

    const [description, setDescription] =
        useState("");

    const [priority, setPriority] = useState<
        "low" | "medium" | "high" | "urgent"
    >("medium");

    const [category, setCategory] =
        useState("");

    const mutation = useCreateMaintenance();

    const submit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        mutation.mutate(
            {
                title,
                description,
                priority,

                ...(category.trim()
                    ? {
                        category:
                            category.trim(),
                    }
                    : {}),
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setDescription("");
                    setCategory("");
                    setPriority("medium");
                },
            }
        );
    };

    return (
        <form
            onSubmit={submit}
            className="
                rounded-2xl
                border
                border-[#e1e3e4]
                bg-white
                p-5
            "
        >
            <h2
                className="
                    text-lg
                    font-bold
                    text-[#191c1d]
                "
            >
                Report a Maintenance Issue
            </h2>

            <p
                className="
                    mt-1
                    text-sm
                    text-[#75777e]
                "
            >
                Your owner will be notified of this request.
            </p>

            <div
                className="
                    mt-5
                    grid
                    gap-4
                    sm:grid-cols-2
                "
            >
                <label
                    className="
                        text-sm
                        font-semibold
                        text-[#44474d]
                    "
                >
                    Issue title

                    <input
                        required
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        className="
                            mt-1.5
                            h-10
                            w-full
                            rounded-xl
                            border
                            border-[#e1e3e4]
                            px-3
                            font-normal
                            text-[#191c1d]
                            outline-none
                            focus:border-[#00696b]
                        "
                    />
                </label>

                <label
                    className="
                        text-sm
                        font-semibold
                        text-[#44474d]
                    "
                >
                    Category

                    <input
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                        placeholder="e.g. Plumbing"
                        className="
                            mt-1.5
                            h-10
                            w-full
                            rounded-xl
                            border
                            border-[#e1e3e4]
                            px-3
                            font-normal
                            text-[#191c1d]
                            outline-none
                            focus:border-[#00696b]
                        "
                    />
                </label>

                <label
                    className="
                        text-sm
                        font-semibold
                        text-[#44474d]
                    "
                >
                    Priority

                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(
                                e.target.value as typeof priority
                            )
                        }
                        className="
                            mt-1.5
                            h-10
                            w-full
                            rounded-xl
                            border
                            border-[#e1e3e4]
                            bg-white
                            px-3
                            font-normal
                            text-[#191c1d]
                            outline-none
                            focus:border-[#00696b]
                        "
                    >
                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>

                        <option value="urgent">
                            Urgent
                        </option>
                    </select>
                </label>

                <label
                    className="
                        sm:col-span-2
                        text-sm
                        font-semibold
                        text-[#44474d]
                    "
                >
                    Description

                    <textarea
                        required
                        minLength={10}
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        rows={4}
                        className="
                            mt-1.5
                            w-full
                            rounded-xl
                            border
                            border-[#e1e3e4]
                            p-3
                            font-normal
                            text-[#191c1d]
                            outline-none
                            focus:border-[#00696b]
                        "
                    />
                </label>
            </div>

            {mutation.isError && (
                <p
                    className="
                        mt-3
                        text-sm
                        text-[#ba1a1a]
                    "
                >
                    {mutation.error instanceof Error
                        ? mutation.error.message
                        : "Unable to submit the request."}
                </p>
            )}

            {mutation.isSuccess && (
                <p
                    className="
                        mt-3
                        text-sm
                        font-semibold
                        text-[#00696b]
                    "
                >
                    Maintenance request submitted.
                </p>
            )}

            <button
                disabled={mutation.isPending}
                className="
                    mt-5
                    rounded-xl
                    bg-[#00696b]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    hover:bg-[#004f51]
                    disabled:opacity-60
                "
            >
                {mutation.isPending
                    ? "Submitting…"
                    : "Submit request"}
            </button>
        </form>
    );
}

export function MaintenanceList({
    requests,
}: {
    requests: MaintenanceRequest[];
}) {
    if (!requests.length) {
        return (
            <div
                className="
                    rounded-2xl
                    border
                    border-dashed
                    border-[#c5c6cd]
                    bg-white
                    p-8
                    text-center
                    text-sm
                    text-[#75777e]
                "
            >
                No maintenance requests have been
                reported for this rental.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((request) => (
                <article
                    key={request.id}
                    className="
                        rounded-2xl
                        border
                        border-[#e1e3e4]
                        bg-white
                        p-5
                    "
                >
                    <div
                        className="
                            flex
                            flex-wrap
                            items-start
                            justify-between
                            gap-3
                        "
                    >
                        <div>
                            <h3
                                className="
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                {request.title}
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-[#75777e]
                                "
                            >
                                Created{" "}
                                {date(request.createdAt)}
                                {" · "}
                                {request.priority}
                                {" priority"}

                                {request.category
                                    ? ` · ${request.category}`
                                    : ""}
                            </p>
                        </div>

                        <Status
                            value={request.status}
                        />
                    </div>

                    <p
                        className="
                            mt-4
                            text-sm
                            text-[#44474d]
                        "
                    >
                        {request.description}
                    </p>

                    {request.ownerResponse && (
                        <p
                            className="
                                mt-4
                                rounded-xl
                                bg-[#f3f4f5]
                                p-3
                                text-sm
                                text-[#44474d]
                            "
                        >
                            <span
                                className="
                                    font-bold
                                    text-[#191c1d]
                                "
                            >
                                Owner update:{" "}
                            </span>

                            {request.ownerResponse}
                        </p>
                    )}

                    {request.resolution && (
                        <p
                            className="
                                mt-3
                                text-sm
                                text-[#00696b]
                            "
                        >
                            <span className="font-bold">
                                Resolution:{" "}
                            </span>

                            {request.resolution}
                        </p>
                    )}

                    <p
                        className="
                            mt-3
                            text-xs
                            text-[#75777e]
                        "
                    >
                        Last updated{" "}
                        {date(request.updatedAt)}
                    </p>
                </article>
            ))}
        </div>
    );
}
