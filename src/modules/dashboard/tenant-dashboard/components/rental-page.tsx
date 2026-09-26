"use client";

import { useTenantRental } from "../hooks/hooks";
import { date, EmptyRental, money, PageState, RentalHero, Status } from "./components";

export default function TenantRentalPage() {
    const query = useTenantRental();
    const rental = query.data;

    if (!rental) {
        return (
            <PageState loading={query.isLoading} error={query.error}>
                <div className="space-y-7 p-6 lg:p-10">
                    <div>
                        <p className="text-sm font-semibold text-[#00696b]">My rental / properties</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">Your rented property</h1>
                    </div>
                    <EmptyRental />
                </div>
            </PageState>
        );
    }

    return (
        <PageState loading={query.isLoading} error={query.error}>
            <div className="space-y-7 p-6 lg:p-10">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">My rental / properties</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">Your rented property</h1>
                </div>
                <RentalHero rental={rental} />
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                        <h2 className="text-lg font-bold text-[#191c1d]">Lease information</h2>
                        <dl className="mt-5 grid grid-cols-2 gap-5 text-sm">
                            <div><dt className="text-[#75777e]">Lease start</dt><dd className="mt-1 font-bold">{date(rental.leaseStart)}</dd></div>
                            <div><dt className="text-[#75777e]">Lease end</dt><dd className="mt-1 font-bold">{date(rental.leaseEnd)}</dd></div>
                            <div><dt className="text-[#75777e]">Monthly rent</dt><dd className="mt-1 font-bold">{money(rental.monthlyRent)}</dd></div>
                            <div><dt className="text-[#75777e]">Security deposit</dt><dd className="mt-1 font-bold">{money(rental.securityDeposit)}</dd></div>
                            <div><dt className="text-[#75777e]">Payment frequency</dt><dd className="mt-1 font-bold capitalize">{rental.paymentFrequency}</dd></div>
                            <div><dt className="text-[#75777e]">Agreement status</dt><dd className="mt-1"><Status value={rental.status} /></dd></div>
                        </dl>
                    </section>
                    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                        <h2 className="text-lg font-bold text-[#191c1d]">Owner information</h2>
                        <dl className="mt-5 space-y-4 text-sm">
                            <div><dt className="text-[#75777e]">Owner name</dt><dd className="mt-1 font-bold">{rental.owner.name}</dd></div>
                            <div><dt className="text-[#75777e]">Email</dt><dd className="mt-1 font-bold"><a className="text-[#00696b] hover:underline" href={`mailto:${rental.owner.email}`}>{rental.owner.email}</a></dd></div>
                            {rental.owner.phone && <div><dt className="text-[#75777e]">Phone</dt><dd className="mt-1 font-bold"><a className="text-[#00696b] hover:underline" href={`tel:${rental.owner.phone}`}>{rental.owner.phone}</a></dd></div>}
                        </dl>
                    </section>
                </div>
                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                    <h2 className="text-lg font-bold text-[#191c1d]">Property details</h2>
                    <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
                        <div><dt className="text-[#75777e]">Property type</dt><dd className="mt-1 font-bold capitalize">{rental.property.propertyType}</dd></div>
                        <div><dt className="text-[#75777e]">Bedrooms / bathrooms</dt><dd className="mt-1 font-bold">{rental.property.bedrooms} / {rental.property.bathrooms}</dd></div>
                        {rental.property.areaSqFt !== undefined && <div><dt className="text-[#75777e]">Area</dt><dd className="mt-1 font-bold">{rental.property.areaSqFt.toLocaleString("en-IN")} sq ft</dd></div>}
                    </dl>
                    {rental.property.amenities.length > 0 && <div className="mt-5"><p className="text-sm text-[#75777e]">Amenities</p><div className="mt-2 flex flex-wrap gap-2">{rental.property.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-[#d9f4f3] px-3 py-1 text-xs font-bold text-[#00696b]">{amenity}</span>)}</div></div>}
                </section>
            </div>
        </PageState>
    );
}
