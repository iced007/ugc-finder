"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PRICE_MAX_TAKA, PRICE_MIN_TAKA } from "@/convex/lib/config";
import { CATEGORIES, PLATFORMS } from "@/convex/lib/validation";

const DEBOUNCE_MS = 300;
const FIELD_CLASS =
  "mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base";
const SELECTS = [
  { name: "category", label: "Category", options: CATEGORIES },
  { name: "platform", label: "Platform", options: PLATFORMS },
] as const;
const NUMBERS = [
  {
    name: "minPrice",
    label: "Minimum price (taka)",
    hint: String(PRICE_MIN_TAKA),
  },
  {
    name: "maxPrice",
    label: "Maximum price (taka)",
    hint: String(PRICE_MAX_TAKA),
  },
  { name: "minFollowers", label: "Minimum followers", hint: "Any" },
] as const;

/** Reads the filters from a URL query string, dropping values that are not valid. */
export function readFilters(params: URLSearchParams) {
  const digits = (name: string) => (params.get(name) ?? "").replace(/\D/g, "");

  return {
    search: params.get("search") ?? "",
    category:
      CATEGORIES.find((value) => value === params.get("category")) ?? "",
    platform: PLATFORMS.find((value) => value === params.get("platform")) ?? "",
    minPrice: digits("minPrice"),
    maxPrice: digits("maxPrice"),
    minFollowers: digits("minFollowers"),
  };
}

export function DirectoryFilters() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.toString();
  const [draft, setDraft] = useState(() => readFilters(searchParams));
  const [seenQuery, setSeenQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // The URL can change from outside the form (reset link, back button).
  if (urlQuery !== seenQuery) {
    setSeenQuery(urlQuery);
    setDraft(readFilters(searchParams));
  }

  // Drops a pending write when the URL changes or the page is left.
  useEffect(() => () => window.clearTimeout(timer.current), [urlQuery]);

  function update(name: keyof typeof draft, value: string) {
    const params = new URLSearchParams(
      Object.entries({ ...draft, [name]: value }).filter(
        ([, entry]) => entry !== "",
      ),
    );
    setDraft(readFilters(params));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query ? `/creators?${query}` : "/creators",
      );
    }, DEBOUNCE_MS);
  }

  const activeCount = [...SELECTS, ...NUMBERS].filter(
    ({ name }) => draft[name] !== "",
  ).length;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <label className="block text-sm font-medium">
        Search by name
        <input
          className={FIELD_CLASS}
          maxLength={100}
          onChange={(event) => update("search", event.target.value)}
          type="search"
          value={draft.search}
        />
      </label>
      <button
        aria-controls="directory-filters"
        aria-expanded={open}
        className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium sm:hidden"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? "Hide filters" : "Show filters"}
        {activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      <div
        className={`${open ? "grid" : "hidden"} gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5`}
        id="directory-filters"
      >
        {SELECTS.map(({ name, label, options }) => (
          <label className="block text-sm font-medium" key={name}>
            {label}
            <select
              className={`${FIELD_CLASS} capitalize`}
              onChange={(event) => update(name, event.target.value)}
              value={draft[name]}
            >
              <option value="">Any</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
        {NUMBERS.map(({ name, label, hint }) => (
          <label className="block text-sm font-medium" key={name}>
            {label}
            <input
              className={FIELD_CLASS}
              inputMode="numeric"
              maxLength={10}
              onChange={(event) => update(name, event.target.value)}
              placeholder={hint}
              value={draft[name]}
            />
          </label>
        ))}
      </div>
    </form>
  );
}
