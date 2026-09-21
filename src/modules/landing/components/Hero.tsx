import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-24 lg:pt-28">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[-18%] w-[70%] bg-[radial-gradient(circle_at_center,rgba(86,245,248,0.17),transparent_62%)]"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00696b]">
          Rentals, made clear
        </p>
        <h1 className="text-[42px] font-bold leading-[1.08] tracking-[-0.045em] text-[#191c1d] sm:text-5xl lg:text-[56px]">
          Find a place.
          <br />
          Request it.
          <br />
          Make it home.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#44474d] sm:text-lg sm:leading-8">
          Discover rental properties, send requests, and manage your rental
          journey from one simple platform.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/properties"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00696b] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,105,107,0.18)] transition hover:bg-[#004f51]"
          >
            Start Exploring
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>

          <Link
            href="#how-it-works"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#75777e] bg-white px-7 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#191c1d] hover:bg-[#f3f4f5]"
          >
            How It Works
          </Link>
        </div>

      </div>
    </section>
  );
}
