import Link from "next/link";
import { buildPropertyQuery, type ParsedPropertyParams } from "../utils/filters";

interface PaginationLinksProps {
  params: ParsedPropertyParams;
  page: number;
  pages: number;
}

export default function PaginationLinks({ params, page, pages }: PaginationLinksProps) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;
  const prevHref = buildPropertyQuery(params, { page: page - 1 });
  const nextHref = buildPropertyQuery(params, { page: page + 1 });

  const linkBase =
    "inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#c5c6cd] px-4 text-sm font-medium text-[#191c1d] transition";
  const disabledClass = "pointer-events-none cursor-not-allowed opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={{ pathname: "/properties", query: prevHref }}
        prefetch
        aria-disabled={prevDisabled}
        className={`${linkBase} ${prevDisabled ? `bg-white ${disabledClass}` : "hover:bg-white"}`}
      >
        <span aria-hidden="true">←</span> Previous
      </Link>

      <span className="px-3 text-sm font-medium text-[#44474d]">
        Page {page} of {pages}
      </span>

      <Link
        href={{ pathname: "/properties", query: nextHref }}
        prefetch
        aria-disabled={nextDisabled}
        className={`${linkBase} ${nextDisabled ? `bg-white ${disabledClass}` : "hover:bg-white"}`}
      >
        Next <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}