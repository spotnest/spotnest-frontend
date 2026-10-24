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

                                        {booking.tenantInquiry?.status === "PENDING" && (
                                            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                                                <p className="font-bold">Occupied Property — 3-Day Move-Out Inquiry in Progress</p>
                                                <p className="mt-0.5 text-xs text-amber-800">
                                                    Current tenant has until {new Date(booking.tenantInquiry.deadline).toLocaleString("en-IN")} to confirm move-out or extension.
                                                    You cannot approve this request until the tenant responds or the 3-day deadline expires.
                                                </p>
                                            </div>
                                        )}

                                        {booking.tenantInquiry?.status && booking.tenantInquiry.status !== "PENDING" && (
                                            <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
                                                <p className="font-bold">Current Tenant Move-Out Status: {booking.tenantInquiry.status.replaceAll("_", " ")}</p>
                                                {booking.tenantInquiry.responseMessage && (
                                                    <p className="mt-0.5 text-xs text-teal-800">
                                                        Tenant response: &quot;{booking.tenantInquiry.responseMessage}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {reviewBooking.isError && <p className="mt-3 text-sm text-red-700">Could not update this request.</p>}
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                disabled={reviewBooking.isPending || (booking.tenantInquiry?.status === "PENDING" && new Date() < new Date(booking.tenantInquiry.deadline))}
                                                onClick={() => reviewBooking.mutate({ bookingId: booking._id, decision: "APPROVED" })}
                                                className="rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                title={booking.tenantInquiry?.status === "PENDING" && new Date() < new Date(booking.tenantInquiry.deadline) ? "Cannot approve until current tenant responds or 3-day deadline expires" : undefined}
                                            >
                                                Approve
                                            </button>
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
                                            {booking.status === "PENDING"
                                                ? "Waiting for Owner Review"
                                                : booking.status === "REJECTED"
                                                  ? "Rental Request Rejected"
                                                  : booking.status === "EXPIRED"
                                                    ? "Rental Request Expired"
                                                    : booking.status === "APPROVED"
                                                      ? "Rental Request Approved — Agreement Required"
                                                      : booking.status.replaceAll("_", " ")}
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

                                {booking.status === "PENDING" && booking.tenantInquiry?.status === "PENDING" && (
                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <p className="font-bold text-amber-900">Property Currently Occupied</p>
                                        <p className="mt-1 text-xs text-amber-800">
                                            The property is currently occupied. We have contacted the current tenant regarding their move-out schedule and will update you within 3 days.
                                        </p>
                                    </div>
                                )}

                                {booking.status === "EXPIRED" && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
                                        <p className="font-semibold text-red-800">Rental request expired</p>
                                        <p className="mt-1 text-sm text-red-700">
                                            This rental request has expired. Please submit a new rental request.
                                        </p>
                                        <Link
                                            href={`/properties/${typeof booking.propertyId === "string" ? booking.propertyId : booking.propertyId._id}`}
                                            className="mt-3 inline-block text-sm font-semibold text-red-800 underline"
                                        >
                                            Submit a new rental request for this property →
                                        </Link>
                                    </div>
                                )}

                                {booking.status === "APPROVED" && (
                                    <div className="mt-5 border-t border-[#eef0f1] pt-4">
                                        <RazorpayPayButton bookingId={booking._id} type="ADVANCE" label={`Pay Advance (${formatPrice(booking.advanceAmount)})`} />
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