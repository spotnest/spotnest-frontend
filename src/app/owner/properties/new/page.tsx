"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import OwnerPropertyForm from "@/src/modules/properties/components/OwnerPropertyForm";
import { createProperty } from "@/src/modules/properties/services/propertyService";
import type {
    OwnerPropertyFormValues,
    Property,
} from "@/src/modules/properties/types";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

export default function NewOwnerPropertyPage() {
    const router = useRouter();

    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner =
        user?.role === "owner" &&
        user.verificationStatus === "approved";

    const queryClient = useQueryClient();
    const [created, setCreated] = useState<Property | null>(null);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (!isOwner) {
            router.replace(dashboardPathForRole(user.role));
        }
    }, [isInitialized, isOwner, router, user]);

    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: (property) => {
            queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
            setCreated(property);
        },
    });

    const handleSubmit = async (
        values: OwnerPropertyFormValues,
        files: File[]
    ) => {
        if (files.length === 0) {
            throw new Error("At least one property photo is required.");
        }

        const formData = new FormData();

        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("propertyType", values.propertyType);
        formData.append("price", String(values.price));
        formData.append("bedrooms", String(values.bedrooms));
        formData.append("bathrooms", String(values.bathrooms));

        if (values.areaSqFt != null) {
            formData.append("areaSqFt", String(values.areaSqFt));
        }

        formData.append("amenities", JSON.stringify(values.amenities));
        formData.append("address", JSON.stringify(values.address));

        files.forEach((file) => formData.append("images", file));

        await createMutation.mutateAsync(formData);
    };

    if (!isInitialized) {
        return null;
    }

    if (!user || !isOwner) {
        return null;
    }

    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[980px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <Link
                    href="/owner/properties"
                    className="text-sm font-semibold text-[#00696b] hover:text-[#004f51]"
                >
                    ← Back to my properties
                </Link>

                <header className="mt-5">
                    <p className="text-sm font-semibold text-[#00696b]">
                        Owner workspace
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                        Add a property
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[#44474d]">
                        Your listing goes live as soon as it&apos;s created — no
                        approval needed. It will appear on the public listings and
                        in &ldquo;Near me&rdquo; searches.
                    </p>
                </header>

                {created ? (
                    <div className="mt-8 rounded-2xl border border-[#cfddd6] bg-[#eef8f2] p-8">
                        <p className="text-lg font-bold text-[#1e5c3a]">
                            Property listed successfully
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#2c6a48]">
                            &ldquo;{created.title}&rdquo; is now live. It&apos;s
                            visible to tenants on the public listings page and in
                            &ldquo;Near me&rdquo; searches around its address.
                        </p>

                        {created.locationResolvedName && (
                            <p className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#2c6a48]">
                                <svg aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                </svg>
                                Location verified: {created.locationResolvedName}
                            </p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/owner/properties"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                            >
                                View my properties
                            </Link>

                            <Link
                                href={`/owner/properties/${created._id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#c5c6cd] bg-white px-5 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                            >
                                Edit listing
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <OwnerPropertyForm
                            mode="create"
                            submitLabel="List property"
                            onSubmit={handleSubmit}
                        />
                    </div>
                )}
            </main>
        </DashboardShell>
    );
}