const APP_NAME = "APP_NAME";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <a className="mr-auto text-lg font-bold tracking-tight" href="#">
          {APP_NAME}
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-stone-600">
          <a className="transition-colors hover:text-stone-950" href="#how-it-works">
            How it works
          </a>
          <a className="transition-colors hover:text-stone-950" href="#creators">
            Creators
          </a>
        </nav>
        <a className="text-sm font-semibold text-stone-950 underline underline-offset-4" href="/signin">
          Sign in
        </a>
      </div>
    </header>
  );
}
