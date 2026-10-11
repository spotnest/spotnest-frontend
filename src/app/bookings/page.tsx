"use client";

import Link from "next/link";
import { useMyBookings } from "@/src/modules/bookings";
import { useOwnerBookingRequests, useReviewBooking } from "@/src/modules/bookings/hooks/useBookings";
import { formatPrice } from "@/src/modules/properties";
import RazorpayPayButton from "@/src/modules/payments/components/RazorpayPayButton";
import { useAppSelector } from "@/src/store/hook";

const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-IN");

const bookingPropertyTitle = (property: string | { title: string }) =>
    typeof property === "string" ? "Rental property" : property.title;

export default function BookingsPage() {
    const user = useAppSelector((state) => state.auth.user);
    const { data: bookings = [], isLoading, isError } = useMyBookings();
    const ownerQuery = useOwnerBookingRequests();
    const reviewBooking = useReviewBooking();

    if (user?.role === "owner") {
        const requests = ownerQuery.data ?? [];
        return (
            <main className="bg-[#f8f9fa] px-4 py-10 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold text-[#191c1d]">Rental requests</h1>
                    <p className="mt-2 text-sm text-[#75777e]">Review tenant requests for your properties.</p>
                    {ownerQuery.isLoading ? (
                        <p className="mt-8 text-sm text-[#75777e]">Loading requests...</p>
                    ) : ownerQuery.isError ? (
                        <p className="mt-8 text-sm text-red-700">Could not load rental requests.</p>
                    ) : requests.length === 0 ? (
                        <p className="mt-8 rounded-xl border border-[#e1e3e4] bg-white p-6 text-sm text-[#75777e]">No pending rental requests.</p>
                    ) : (
                        <div className="mt-8 space-y-4">
                            {requests.map((booking) => {
                                const tenant = typeof booking.userId === "string" ? null : booking.userId;
                                return (
                                    <article key={booking._id} className="rounded-xl border border-[#e1e3e4] bg-white p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00696b]">Pending approval</p>
                                                <h2 className="mt-1 text-xl font-semibold text-[#191c1d]">{bookingPropertyTitle(booking.propertyId)}</h2>
                                                <p className="mt-2 text-sm text-[#44474d]">Tenant: {tenant?.name ?? "Tenant"}</p>
                                                {tenant?.email && <p className="text-sm text-[#75777e]">{tenant.email}</p>}
                                                {tenant?.phone && <p className="text-sm text-[#75777e]">{tenant.phone}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                                <span className="text-[#75777e]">Starts</span><span className="font-medium">{dateLabel(booking.startDate)}</span>
                                                <span className="text-[#75777e]">Ends</span><span className="font-medium">{dateLabel(booking.endDate)}</span>
                                                <span className="text-[#75777e]">Monthly rent</span><span className="font-medium">{formatPrice(booking.monthlyRent)}</span>
                                                <span className="text-[#75777e]">Advance</span><span className="font-medium">{formatPrice(booking.advanceAmount)}</span>
                                            </div>
                                        </div>
                                        {booking.notes && <p className="mt-4 text-sm text-[#44474d]">{booking.notes}</p>}
                                        {reviewBooking.isError && <p className="mt-3 text-sm text-red-700">Could not update this request.</p>}
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <button type="button" disabled={reviewBooking.isPending} onClick={() => reviewBooking.mutate({ bookingId: booking._id, decision: "APPROVED" })} className="rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Approve</button>
                                            <button type="button" disabled={reviewBooking.isPending} onClick={() => reviewBooking.mutate({ bookingId: booking._id, decision: "REJECTED" })} className="rounded-lg border border-[#b42318] px-4 py-2.5 text-sm font-semibold text-[#b42318] disabled:opacity-60">Reject</button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#f8f9fa] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">My bookings</h1>
                <p className="mt-2 text-sm text-[#75777e]">
                    Track your rental requests and payment status.
                </p>

                {isLoading ? (
                    <div className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-6 text-sm text-[#44474d]">
                        Loading bookings...
                    </div>
                ) : isError ? (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        We could not load your bookings right now.
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-6 text-sm text-[#44474d]">
                        You do not have any bookings yet.
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {bookings.map((booking) => (
                            <article
                                key={booking._id}
                                className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
                                            Booking #{booking._id.slice(-6).toUpperCase()}
                                        </p>
                                        <h2 className="mt-1 text-xl font-semibold text-[#191c1d]">
                                            {booking.status === "PENDING" ? "Waiting for Owner Approval" : booking.status === "REJECTED" ? "Rental Request Rejected" : booking.status.replaceAll("_", " ")}
                                        </h2>
                                        <p className="mt-1 text-sm text-[#75777e]">{bookingPropertyTitle(booking.propertyId)}</p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-[#75777e]">Monthly rent</p>
                                        <p className="text-lg font-bold text-[#191c1d]">
                                            {formatPrice(booking.monthlyRent)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 text-sm text-[#44474d] sm:grid-cols-3">
                                    <div>
                                        <p className="text-[#75777e]">Payment status</p>
                                        <p className="mt-1 font-medium text-[#191c1d]">{booking.paymentStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#75777e]">Currency</p>
                                        <p className="mt-1 font-medium text-[#191c1d]">{booking.currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#75777e]">Created</p>
                                        <p className="mt-1 font-medium text-[#191c1d]">
                                            {new Date(booking.created_at).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[#75777e]">Rental dates</p>
                                        <p className="mt-1 font-medium text-[#191c1d]">{dateLabel(booking.startDate)} – {dateLabel(booking.endDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#75777e]">Advance</p>
                                        <p className="mt-1 font-medium text-[#191c1d]">{formatPrice(booking.advanceAmount)}</p>
                                    </div>
                                </div>
                                {booking.status === "APPROVED" && booking.paymentStatus === "ADVANCE_PAYMENT_PENDING" && (
                                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#eef0f1] pt-4">
                                        <div>
                                            <p className="font-semibold text-[#191c1d]">Advance payment required</p>
                                            <p className="mt-1 text-sm text-[#75777e]">{formatPrice(booking.advanceAmount)}</p>
                                        </div>
                                        <RazorpayPayButton bookingId={booking._id} type="ADVANCE" label="Pay Advance" />
                                    </div>
                                )}
                                {(booking.paymentStatus === "PAID" || ["CONFIRMED", "ACTIVE"].includes(booking.status)) && (
                                    <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#00696b]/30 bg-[#f0fbfb] p-4">
                                        <div>
                                            <p className="font-semibold text-[#00696b]">Tenancy Confirmed & Active</p>
                                            <p className="mt-0.5 text-xs text-[#75777e]">
                                                Advance deposit paid. View your rental agreement, shared occupants, and pay monthly rent in the Tenant Portal.
                                            </p>
                                        </div>
                                        <Link
                                            href="/tenant/dashboard/rental"
                                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#00696b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#004f51]"
                                        >
                                            Go to Tenant Portal →
                                        </Link>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}