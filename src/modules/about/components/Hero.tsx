import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[-15%] w-[60%] bg-[radial-gradient(circle_at_center,rgba(86,245,248,0.16),transparent_62%)]"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00696b]">
          About SpotNest
        </p>
        <h1 className="text-[38px] font-bold leading-[1.1] tracking-[-0.045em] text-[#191c1d] sm:text-5xl lg:text-[52px]">
          Renting made simple,
          <br />
          transparent, and human.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#44474d] sm:text-lg sm:leading-8">
          SpotNest is a property rental platform built to take the confusion
          out of finding a home. Discover properties, request them directly,
          and manage your rental journey in one clear place.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/properties"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00696b] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,105,107,0.18)] transition hover:bg-[#004f51]"
          >
            Explore Properties
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#75777e] bg-white px-7 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#191c1d] hover:bg-[#f3f4f5]"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}