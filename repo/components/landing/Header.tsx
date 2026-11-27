import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link className="mr-auto inline-flex min-h-11 items-center px-2 text-lg font-bold tracking-tight" href="/">
          {APP_NAME}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-stone-600">
          <Link className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-stone-950" href="/#how-it-works">
            How it works
          </Link>
          <Link className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-stone-950" href="/#creators">
            Creators
          </Link>
        </nav>
        <a
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-stone-950 underline underline-offset-4"
          href="/signin"
        >
          Sign in
        </a>
      </div>
    </header>
  );
}
