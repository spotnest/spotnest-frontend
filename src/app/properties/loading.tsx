export default function PropertiesLoading() {
  return (
    <main className="bg-[#f8f9fa] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-4 w-32 animate-pulse rounded bg-[#e7e8e9]" />
          <div className="mx-auto h-11 w-72 animate-pulse rounded bg-[#e7e8e9]" />
          <div className="mx-auto mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-[#e7e8e9]" />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="h-10 w-32 animate-pulse rounded-full bg-[#e7e8e9]" />
        </div>

        <div className="mt-10 h-[116px] animate-pulse rounded-2xl bg-[#e7e8e9]" />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white"
            >
              <div className="aspect-[1.55/1] bg-[#e7e8e9]" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-28 rounded bg-[#e7e8e9]" />
                <div className="h-5 w-3/4 rounded bg-[#e7e8e9]" />
                <div className="h-4 w-1/2 rounded bg-[#e7e8e9]" />
                <div className="h-9 w-full rounded-lg bg-[#e7e8e9]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}