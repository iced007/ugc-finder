export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
      <div className="max-w-3xl">
        <p className="mb-5 text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
          UGC, made simple
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Get a UGC video for your product, from 5,000 taka.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
          Brands pay safely for creator-made content, and creators get paid for work they are proud to make.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a className="flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700" href="#">
            I&apos;m a brand
          </a>
          <a className="flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-950 transition-colors hover:border-stone-950" href="#">
            I&apos;m a creator
          </a>
        </div>
      </div>
    </section>
  );
}
