 "use client";
 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { signedOut } from "@/src/store/slices/authSlice";
import { logout } from "@/src/modules/auth/services/authServices";
import { dashboardPathForRole } from "@/src/constants/routes";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
const { isAuthenticated, user, isInitialized } = useAppSelector(
  (state) => state.auth
);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(signedOut());
      router.push("/login");
    }
  };

  const dashboardHref = dashboardPathForRole(user?.role);

  return (
    <header className="border-b border-[#e7e8e9] bg-[#f8f9fa]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-2xl"
        >
          SpotNest
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href="/"
            className="border-b-2 border-[#191c1d] py-1 text-sm font-medium text-[#191c1d] transition hover:text-[#00696b]"
          >
            Home
          </Link>

          <Link
            href="/properties"
            className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
          >
            Properties
          </Link>

          <Link
            href="/about"
            className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
         {isInitialized && isAuthenticated ?  (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004f51] sm:px-5"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[#ba1a1a]/30 px-3 py-2 text-sm font-medium text-[#ba1a1a] transition hover:bg-[#ffdad6]/40 sm:px-4"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#191c1d] transition hover:bg-[#edeeef] sm:px-4"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#191c1d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00696b] sm:px-5"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
