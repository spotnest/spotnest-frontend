export default function Search() {
  return (
    <section className="relative z-10 -mt-12 px-4 sm:-mt-14 sm:px-6">
      <div className="mx-auto max-w-[980px] rounded-2xl border border-[#e1e3e4] bg-white p-3 shadow-[0_10px_28px_rgba(25,28,29,0.1)] sm:p-3.5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
          <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#75777e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
            </svg>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">Location</span>
              <input aria-label="Location" className="mt-0.5 w-full min-w-0 bg-transparent text-sm font-medium text-[#191c1d] outline-none placeholder:text-[#75777e]" placeholder="Where do you want to live?" />
            </span>
          </label>

          <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#75777e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9l7-4 7 4v12M9 21v-4h6v4M9 11h.01M15 11h.01" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">Property type</span>
              <select aria-label="Property type" defaultValue="" className="mt-0.5 w-full appearance-none bg-transparent text-sm font-medium text-[#191c1d] outline-none">
                <option value="" disabled>Select a type</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
              </select>
            </span>
          </label>

          <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#75777e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path strokeLinecap="round" d="M7 12h.01M17 12h.01M9 15h6" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">Rent range</span>
              <select aria-label="Rent range" defaultValue="" className="mt-0.5 w-full appearance-none bg-transparent text-sm font-medium text-[#191c1d] outline-none">
                <option value="" disabled>Choose your budget</option>
                <option>Under ₹15,000</option>
                <option>₹15,000 – ₹25,000</option>
                <option>Over ₹25,000</option>
              </select>
            </span>
          </label>

          <button type="button" aria-label="Search properties" className="flex min-h-[58px] items-center justify-center gap-2 rounded-lg bg-[#191c1d] px-5 text-sm font-semibold text-white transition hover:bg-[#00696b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00696b]">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="m16 16 4 4" />
            </svg>
            <span className="lg:sr-only">Search</span>
          </button>
        </div>
      </div>
    </section>
  );
}
