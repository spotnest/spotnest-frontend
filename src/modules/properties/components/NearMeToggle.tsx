import Link from "next/link";

interface NearMeToggleProps {
  active?: boolean;
}

export default function NearMeToggle({ active = false }: NearMeToggleProps) {
  const href = active ? "/properties" : "/properties?near=1";
  return (
    <Link
      href={href}
      aria-pressed={active}
      className="group inline-flex items-center gap-3 rounded-full border border-[#c5c6cd] bg-white py-2 pl-4 pr-2 text-sm font-semibold text-[#191c1d] transition hover:border-[#00696b]"
    >
      <span className={active ? "text-[#00696b]" : ""}>Near me</span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${active ? "bg-[#00696b]" : "bg-[#c5c6cd]"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${active ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
    </Link>
  );
}