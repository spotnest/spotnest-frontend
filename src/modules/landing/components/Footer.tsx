import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#c5c6cd] bg-[#e1e3e4] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between">

        {/* Logo */}
        <div>
          <Link href="/" className="text-xl font-bold tracking-[-0.035em] text-[#191c1d]">
            SpotNest
          </Link>

          <p className="mt-2 text-sm text-[#44474d]">
            Find a place. Request it. Make it home.
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link href="/" className="font-medium text-[#44474d] transition hover:text-[#00696b]">
            Home
          </Link>

          <Link href="/properties" className="font-medium text-[#44474d] transition hover:text-[#00696b]">
            Properties
          </Link>

          <Link href="/about" className="font-medium text-[#44474d] transition hover:text-[#00696b]">
            About
          </Link>

          <Link href="/contact" className="font-medium text-[#44474d] transition hover:text-[#00696b]">
            Contact
          </Link>
        </nav>

      </div>

      <div className="mx-auto mt-8 max-w-[1280px] border-t border-[#c5c6cd] pt-6 text-sm text-[#44474d]">
        © 2026 SpotNest. All rights reserved.
      </div>
    </footer>
  );
}
