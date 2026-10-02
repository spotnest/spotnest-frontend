import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";

export default function OwnerRequestsPage() {
    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <p className="text-sm font-semibold text-[#00696b]">
                    Owner workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                    Visit Requests
                </h1>1w1=iiiiii
                <p className="mt-2 text-sm leading-6 text-[#44474d]">
                    Review and manage property visit requests from users.
                </p>
            </main>
        </DashboardShell>
    );
}
