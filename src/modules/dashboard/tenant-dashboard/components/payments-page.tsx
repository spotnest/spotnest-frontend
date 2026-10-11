"use client";

import {
    Card,
    EmptyRental,
    PageState,
    PaymentTable,
    Status,
    date,
    money,
} from "./components";

import { useTenantPayments } from "../hooks/hooks";
import RazorpayPayButton from "@/src/modules/payments/components/RazorpayPayButton";

export default function TenantPaymentsPage() {
    const query = useTenantPayments();

    const data = query.data;
    const outstandingMonthlyPayment = data?.payments
        .filter((payment) => payment.type === "MONTHLY_RENT" && payment.status.toLowerCase() !== "paid" && payment.billingMonth)
        .sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))[0];

    return (
        <PageState
            loading={query.isLoading}
            error={query.error}
        >
            <div
                className="
                    space-y-7
                    p-6
                    lg:p-10
                "
            >
                <div>
                    <p
                        className="
                            text-sm
                            font-semibold
                            text-[#00696b]
                        "
                    >
                        Payments
                    </p>

                    <h1
                        className="
                            mt-1
                            text-3xl
                            font-bold
                            text-[#191c1d]
                        "
                    >
                        Rental payments
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-[#75777e]
                        "
                    >
                        Your actual payment records and
                        current payment state.
                    </p>
                </div>

                {!data?.rental || !data.summary ? (
                    <EmptyRental
                        title="No rental payments to show"
                    />
                ) : (
                    <>
                        {data.rental.bookingId && outstandingMonthlyPayment?.billingMonth && (
                            <section className="flex flex-col gap-4 rounded-xl border border-[#e1e3e4] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold text-[#191c1d]">Monthly rent · {outstandingMonthlyPayment.billingMonth}</h2>
                                    <p className="mt-1 text-sm text-[#75777e]">
                                        {money(outstandingMonthlyPayment.amount)} due {date(outstandingMonthlyPayment.dueDate)}.
                                    </p>
                                </div>
                                <RazorpayPayButton
                                    bookingId={data.rental.bookingId}
                                    type="MONTHLY_RENT"
                                    billingMonth={outstandingMonthlyPayment.billingMonth}
                                    label="Pay Monthly Rent"
                                />
                            </section>
                        )}

                        <div
                            className="
                                grid
                                gap-4
                                sm:grid-cols-2
                                xl:grid-cols-4
                            "
                        >
                            <Card
                                title="Advance payment"
                                value={money(
                                    data.rental.securityDeposit
                                )}
                            >
                                <div className="mt-3">
                                    <Status
                                        value={
                                            data.summary
                                                .depositStatus
                                        }
                                    />
                                </div>
                            </Card>

                            <Card
                                title="Recent payment"
                                value={
                                    data.summary.recentPayment
                                        ? money(
                                            data.summary
                                                .recentPayment
                                                .amount
                                        )
                                        : "—"
                                }
                                detail={
                                    data.summary.recentPayment
                                        ? `Paid ${date(
                                            data.summary
                                                .recentPayment
                                                .paidAt
                                        )}`
                                        : "No completed payment"
                                }
                            />

                            <Card
                                title="Payment due"
                                value={
                                    data.summary.nextPayment
                                        ? money(
                                            data.summary
                                                .nextPayment
                                                .amount
                                        )
                                        : "No pending payment"
                                }
                                detail={
                                    data.summary.nextPayment
                                        ? `Due ${date(
                                            data.summary
                                                .nextPayment
                                                .dueDate
                                        )}`
                                        : undefined
                                }
                            >
                                {data.summary.nextPayment && (
                                    <div className="mt-3">
                                        <Status
                                            value={
                                                data.summary
                                                    .nextPayment
                                                    .status
                                            }
                                        />
                                    </div>
                                )}
                            </Card>

                            <Card
                                title="Fine"
                                value={money(
                                    data.summary.fine
                                )}
                                detail={
                                    data.summary.fine
                                        ? "Late fee currently recorded"
                                        : "No fine recorded"
                                }
                            />
                        </div>

                        <section
                            className="
                                rounded-2xl
                                border
                                border-[#e1e3e4]
                                bg-white
                            "
                        >
                            <div
                                className="
                                    border-b
                                    border-[#e1e3e4]
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
                                    Payment history
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-[#75777e]
                                    "
                                >
                                    Total paid:{" "}
                                    {money(
                                        data.summary.totalPaid
                                    )}

                                    {" · "}

                                    Outstanding:{" "}
                                    {money(
                                        data.summary.outstanding
                                    )}
                                </p>
                            </div>

                            <PaymentTable
                                payments={data.payments}
                            />
                        </section>
                    </>
                )}
            </div>
        </PageState>
    );
}