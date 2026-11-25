export function CtaBand() {
  return (
    <section className="bg-emerald-800 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to make something people remember?</h2>
          <p className="mt-4 text-lg leading-8 text-emerald-50">Bring your next product story to life with the right creator.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <a className="flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-100" href="/signup">
            I&apos;m a brand
          </a>
          <a className="flex min-h-11 items-center justify-center rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700" href="/signup">
            I&apos;m a creator
          </a>
        </div>
      </div>
    </section>
  );
}
