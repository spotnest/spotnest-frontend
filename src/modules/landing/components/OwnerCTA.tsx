import Link from "next/link";
export default function OwnerCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-3xl bg-[#050a0b] px-6 py-14 text-center text-white sm:px-10 sm:py-16 lg:py-20">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00696b]/35 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[#56f5f8]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#56f5f8]">
              For property owners
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-[32px]">
              Have a Property to Rent?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/75">
              List your property on SpotNest and reach potential tenants.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#56f5f8] px-7 py-3 text-sm font-semibold text-[#003f41] transition hover:bg-white"
            >
              List Your Property <span aria-hidden="true" className="text-lg leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
