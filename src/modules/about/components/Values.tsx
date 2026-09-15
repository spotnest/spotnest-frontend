const values = [
  {
    number: "01",
    title: "Simple",
    description:
      "Find and explore rental properties without unnecessary complexity.",
  },
  {
    number: "02",
    title: "Reliable",
    description:
      "Keep your property search and rental requests organized in one place.",
  },
  {
    number: "03",
    title: "Transparent",
    description:
      "Know what you're looking at — consistent details on every listing.",
  },
];

export default function Values() {
  return (
    <section className="bg-[#eef6f5] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
            What we stand for
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-[32px]">
            Principles that shape every listing
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {values.map((value) => (
            <article
              key={value.number}
              className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-7"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d9f4f3] text-sm font-bold tracking-[0.12em] text-[#00696b]">
                {value.number}
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                {value.title}
              </h3>

              <p className="mt-3 leading-7 text-[#44474d]">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}