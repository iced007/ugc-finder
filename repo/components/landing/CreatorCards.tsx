import { placeholderCreators } from "@/lib/placeholder-creators";

const taka = new Intl.NumberFormat("en-BD");

export function CreatorCards() {
  return (
    <section id="creators">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">Creators</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Find a creator for your next story.</h2>
          <p className="max-w-sm text-stone-600">Browse styles and starting rates from creators across Bangladesh.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderCreators.map((creator) => (
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" key={creator.name}>
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-stone-950 text-lg font-bold text-white" aria-hidden="true">
                  {creator.name.charAt(0)}
                </span>
                <div>
                  <h3 className="font-semibold text-stone-950">{creator.name}</h3>
                  <p className="text-sm text-stone-600">{creator.category}</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-stone-600">Starting from</p>
              <p className="mt-1 text-xl font-bold text-stone-950">৳{taka.format(creator.price)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
