"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  DirectoryFilters,
  readFilters,
} from "@/components/directory/DirectoryFilters";
import { api } from "@/convex/_generated/api";

type Filters = ReturnType<typeof readFilters>;

const toNumber = (value: string) => (value === "" ? undefined : Number(value));

function ResultsPage({
  filters,
  page,
  onLoadMore,
}: {
  filters: Filters;
  page: number;
  onLoadMore: (() => void) | null;
}) {
  const result = useQuery(api.creators.listPublic, {
    search: filters.search || undefined,
    category: filters.category || undefined,
    platform: filters.platform || undefined,
    minPrice: toNumber(filters.minPrice),
    maxPrice: toNumber(filters.maxPrice),
    minFollowers: toNumber(filters.minFollowers),
    page,
  });

  if (result === undefined) {
    return (
      <p className="col-span-full text-sm text-stone-600">Loading creators…</p>
    );
  }

  if (page === 0 && result.creators.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p>No creators match these filters</p>
        <Link
          className="mt-2 inline-flex min-h-11 items-center font-medium text-emerald-700 underline"
          href="/creators"
        >
          Reset filters
        </Link>
      </div>
    );
  }

  return (
    <>
      {result.creators.map((creator) => {
        const top = [...creator.socialAccounts].sort(
          (a, b) => b.followerCount - a.followerCount,
        )[0];

        return (
          <Link
            className="block min-w-0 rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-700"
            href={`/creators/${creator.profileId}`}
            key={creator.profileId}
          >
            <h2 className="text-lg font-semibold break-words">
              {creator.displayName}
            </h2>
            <p className="text-sm text-stone-600 capitalize">
              {creator.categories.join(", ")}
            </p>
            <p className="mt-3 font-medium">
              ৳{creator.pricePerVideo.toLocaleString("en-US")} per video
            </p>
            {top ? (
              <p className="text-sm text-stone-600">
                <span className="capitalize">{top.platform}</span>:{" "}
                {top.followerCount.toLocaleString("en-US")} followers
              </p>
            ) : null}
          </Link>
        );
      })}
      {result.hasMore && onLoadMore ? (
        <button
          className="col-span-full min-h-11 justify-self-center rounded-full bg-emerald-700 px-6 text-sm font-medium text-white"
          onClick={onLoadMore}
          type="button"
        >
          Load more
        </button>
      ) : null}
    </>
  );
}

function Results({ filters }: { filters: Filters }) {
  const [pageCount, setPageCount] = useState(1);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: pageCount }, (_, page) => (
        <ResultsPage
          filters={filters}
          key={page}
          onLoadMore={
            page === pageCount - 1 ? () => setPageCount(pageCount + 1) : null
          }
          page={page}
        />
      ))}
    </div>
  );
}

function Directory() {
  const searchParams = useSearchParams();

  return (
    <>
      <DirectoryFilters />
      {/* A new key goes back to the first page when the filters change. */}
      <Results
        filters={readFilters(searchParams)}
        key={searchParams.toString()}
      />
    </>
  );
}

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mb-4 text-2xl font-semibold">Find creators</h1>
        <Suspense
          fallback={<p className="text-sm text-stone-600">Loading creators…</p>}
        >
          <Directory />
        </Suspense>
      </main>
    </div>
  );
}
