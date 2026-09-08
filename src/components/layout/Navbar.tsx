export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <div className="text-2xl font-bold">
          Spotnest
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="/" className="text-sm font-medium hover:text-gray-600">
            Home
          </a>

          <a
            href="/properties"
            className="text-sm font-medium hover:text-gray-600"
          >
            Properties
          </a>

          <a
            href="/about"
            className="text-sm font-medium hover:text-gray-600"
          >
            About
          </a>

          <a
            href="/contact"
            className="text-sm font-medium hover:text-gray-600"
          >
            Contact
          </a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Register
          </a>
        </div>

      </nav>
    </header>
  );
}