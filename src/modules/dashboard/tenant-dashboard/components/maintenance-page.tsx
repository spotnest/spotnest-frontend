"use client";

import {
    EmptyRental,
    MaintenanceForm,
    MaintenanceList,
    PageState,
} from "./components";
import { useTenantMaintenance } from "../hooks/hooks";

export default function TenantMaintenancePage() {
    const query = useTenantMaintenance();

    return (
        <PageState loading={query.isLoading} error={query.error}>
            <div className="space-y-7 p-6 lg:p-10">
                {/* Header */}
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">
                        Maintenance
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">
                        Maintenance & Repairs
                    </h1>

                    <p className="mt-2 text-sm text-[#75777e]">
                        Report issues with your rented property and follow
                        their progress.
                    </p>
                </div>

                {/* Content */}
                {!query.data?.rental ? (
                    <EmptyRental title="No rental available for maintenance requests" />
                ) : (
                    <>
                        <MaintenanceForm />

                        <section>
                            <h2 className="mb-4 text-xl font-bold text-[#191c1d]">
                                Request Activity
                            </h2>

                            <MaintenanceList
                                requests={query.data.requests}
                            />
                        </section>
                    </>
                )}
            </div>
        </PageState>
    );
}