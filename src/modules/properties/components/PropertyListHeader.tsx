interface PropertyListHeaderProps {
  total: number;
}

export default function PropertyListHeader({ total }: PropertyListHeaderProps) {
  return (
    <div className="text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
        {total > 0 ? `${total} properties available` : "Browse rentals"}
      </p>
      <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-5xl">
        Explore Properties
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#44474d]">
        Discover rental homes that fit your lifestyle — search by location, type, and budget.
      </p>
    </div>
  );
}