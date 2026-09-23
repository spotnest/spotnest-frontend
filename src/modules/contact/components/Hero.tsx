import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[-15%] w-[55%] bg-[radial-gradient(circle_at_center,rgba(86,245,248,0.16),transparent_62%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00696b]">
          Contact us
        </p>
        <h1 className="text-[38px] font-bold leading-[1.1] tracking-[-0.045em] text-[#191c1d] sm:text-5xl lg:text-[52px]">
          We&apos;d love to hear from you.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#44474d] sm:text-lg sm:leading-8">
          Questions about a property, your account, or listing your home? Reach
          out and our team will take care of you.
        </p>

        <Link
          href="/properties"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-[#75777e] bg-white px-7 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#191c1d] hover:bg-[#f3f4f5]"
        >
          Browse Properties
        </Link>
      </div>
    </section>
  );
}