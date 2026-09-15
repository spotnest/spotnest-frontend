const stats = [
  { value: "300+", label: "Listed Properties" },
  { value: "1,200+", label: "Rental Requests" },
  { value: "12", label: "Cities Covered" },
  { value: "150+", label: "Property Owners" },
];

export default function Story() {
  return (
    <section className="border-y border-[#e7e8e9] bg-white px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
              Our story
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-[32px]">
              Renting a home shouldn&apos;t feel like a maze.
            </h2>

            <div className="mt-5 space-y-5 leading-7 text-[#44474d]">
              <p>
                For too long, finding a rental has meant scattered listings,
                unclear terms, and endless back-and-forth. SpotNest began with
                a simple idea: give renters a clear view of what&apos;s
                available and let them request a property directly.
              </p>
              <p>
                We built a platform where every property is presented
                consistently, every request is tracked, and every decision is
                easier to make. No noise, no guesswork — just a straight path
                from discovery to home.
              </p>
              <p>
                Today, SpotNest connects renters with owners across growing
                cities, and we&apos;re just getting started.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e1e3e4] bg-[#eef6f5] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <p className="text-3xl font-bold tracking-[-0.03em] text-[#00696b]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-[#44474d]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}