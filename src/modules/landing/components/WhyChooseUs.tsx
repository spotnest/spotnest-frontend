const reasons = [
  {
    title: "Simple",
    description: "Find and explore rental properties without unnecessary complexity.",
  },
  {
    title: "Reliable",
    description: "Keep your property search and rental requests organized in one place.",
  },
  {
    title: "Convenient",
    description: "Manage your rental journey easily from discovery to request.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-[#eef6f5] px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
            Designed around renters
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-[32px]">
            Why Choose SpotNest?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#44474d]">
            A simple and convenient way to find and manage your next rental.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {reasons.map((reason, index) => (
            <article
              key={reason.title}
              className="rounded-2xl border border-white/80 bg-white p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-7"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d9f4f3] text-lg font-bold text-[#00696b]">
                0{index + 1}
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                {reason.title}
              </h3>

              <p className="mt-3 leading-7 text-[#44474d]">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
