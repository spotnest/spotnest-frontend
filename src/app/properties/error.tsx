"use client";

import Link from "next/link";

export default function PropertiesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-[#f8f9fa] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-2xl border border-[#ffdad6] bg-[#fff5f4] p-10 text-center">
          <p className="text-lg font-semibold text-[#ba1a1a]">Something went wrong</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8c3a3a]">
            Could not load properties. Make sure the backend is running, then try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
          >
            Try again
          </button>
          <p className="mt-4">
            <Link href="/" className="text-sm font-semibold text-[#00696b] hover:text-[#004f51]">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}