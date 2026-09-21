const steps = [
  {
    number: "01",
    title: "Find a Property",
    description: "Browse properties and find a place that matches your needs.",
  },
  {
    number: "02",
    title: "Send a Request",
    description: "Choose a property and send a rental request to the owner.",
  },
  {
    number: "03",
    title: "Make It Home",
    description:
      "Once your request is accepted, move forward with your new home.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-[#e7e8e9] bg-white px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
            A clear process
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-[32px]">
            How It Works
          </h2>

          <p className="mt-3 text-base leading-7 text-[#44474d]">
            Finding your next home is simple with SpotNest.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative overflow-hidden rounded-2xl border border-[#e1e3e4] bg-[#f8f9fa] p-6 sm:p-7"
            >
              <span className="text-sm font-bold tracking-[0.12em] text-[#00696b]">
                {step.number}
              </span>

              <div aria-hidden="true" className="absolute right-6 top-5 text-5xl font-bold tracking-[-0.08em] text-[#e1e3e4]">
                {step.number}
              </div>
              <h3 className="relative mt-8 text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                {step.title}
              </h3>

              <p className="relative mt-3 leading-7 text-[#44474d]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
