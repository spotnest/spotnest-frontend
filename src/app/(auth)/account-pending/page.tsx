"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";
import { Suspense } from "react";

export default function AccountPendingPage() {
    return (
        <Suspense fallback={null}>
            <PendingAccountContent />
        </Suspense>
    );
}

function PendingAccountContent() {
    const email = useSearchParams().get("email");

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-5 py-12 text-[#1C1B1A] sm:px-10">
            <section className="w-full max-w-[525px] rounded-2xl border border-[#CFCBC3]/60 bg-white p-8 text-center shadow-[0_10px_30px_rgba(28,27,26,0.08)] sm:p-10">
                <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4CE6] text-sm text-white">S</span>
                    SpotNest
                </Link>
                <span className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0dc] text-[#95611d] ring-8 ring-[#fff0dc]/50">
                    <Clock3 className="h-8 w-8" aria-hidden="true" />
                </span>
                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#6C4CE6]">Account review</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">Approval pending</h1>
                <p className="mt-4 text-base leading-7 text-[#6F6B65]">
                    Your account is pending admin approval. Please wait for approval before accessing the Owner/Agent dashboard.
                </p>
                {email && <p className="mt-3 break-all text-sm font-semibold text-[#1C1B1A]">{email}</p>}
                <div className="mt-8 space-y-3">
                    <Link href="/login" className="flex h-[54px] w-full items-center justify-center rounded-xl bg-[#6C4CE6] px-5 text-base font-semibold text-white transition hover:bg-[#5738C7]">
                        Return to login
                    </Link>
                    <Link href="/" className="block py-2 text-sm font-semibold text-[#6F6B65] transition hover:text-[#1C1B1A]">Back to home</Link>
                </div>
            </section>
        </main>
    );
}
