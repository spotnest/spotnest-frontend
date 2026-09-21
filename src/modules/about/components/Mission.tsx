import Link from "next/link";

export default function Mission() {
  return (
    <section className="border-t border-[#e7e8e9] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
            Our mission
          </p>
          <p className="text-2xl font-semibold leading-snug tracking-[-0.03em] text-[#191c1d] sm:text-3xl sm:leading-snug">
            &ldquo;Make finding a rental as clear and straightforward as the
            home itself — for renters and owners alike.&rdquo;
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#44474d]">
            Whether you&apos;re searching for your next place or listing a
            property you own, SpotNest gives you a simple, reliable path forward.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00696b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
          >
            Join SpotNest
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}