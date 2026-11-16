const steps = [
  "Write a brief for your product and the content you need.",
  "Pick a creator whose style feels right for your brand.",
  "Pay securely while the platform holds the money.",
  "Approve the video and the creator is paid.",
];

export function HowItWorks() {
  return (
    <section className="border-y border-stone-200 bg-white" id="how-it-works">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">How it works</p>
        <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">A clear path from brief to approved video.</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li className="rounded-2xl border border-stone-200 p-5" key={step}>
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {index + 1}
              </span>
              <p className="mt-4 leading-7 text-stone-700">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
