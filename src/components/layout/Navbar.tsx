import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">
          Spot<span className="text-emerald-600">nest</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex text-slate-600">
          <Link href="/" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            Home
          </Link>

          <Link
            href="/properties"
            className="text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            Properties
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            Register
          </Link>
        </div>

      </nav>
    </header>
  );
}