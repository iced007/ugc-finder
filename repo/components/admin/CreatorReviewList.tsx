"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useState } from "react";

import { SignedVideo } from "@/components/video/SignedVideo";
import { api } from "@/convex/_generated/api";

type Creator = NonNullable<
  FunctionReturnType<typeof api.admin.listCreators>
>[number];

const TABS = [
  { label: "Waiting", approved: false },
  { label: "Approved", approved: true },
] as const;

function CreatorCard({
  creator,
  approved,
}: {
  creator: Creator;
  approved: boolean;
}) {
  const setCreatorApproval = useMutation(api.admin.setCreatorApproval);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setSaving(true);

    try {
      // On success the card leaves this tab, so `saving` stays true.
      await setCreatorApproval({ profileId: creator._id, approved: !approved });
    } catch (error) {
      console.error(error);
      setError(
        error instanceof ConvexError
          ? String(error.data)
          : "We could not update this creator. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold break-words">
        {creator.displayName}
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        {creator.categories.join(", ")} · ৳
        {creator.pricePerVideo.toLocaleString("en-US")} per video
      </p>
      <p className="mt-2 text-sm break-words whitespace-pre-line">
        {creator.bio}
      </p>

      {creator.socialAccounts.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">No social accounts.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {creator.socialAccounts.map((account, index) => (
            <li key={index}>
              <a
                className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 text-sm font-semibold capitalize"
                href={account.pageUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {account.platform} ↗
              </a>
            </li>
          ))}
        </ul>
      )}

      {creator.sampleIds.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">No samples yet.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {creator.sampleIds.map((sampleId) => (
            <li key={sampleId}>
              <SignedVideo sampleId={sampleId} />
            </li>
          ))}
        </ul>
      )}

      <button
        className={`mt-4 min-h-11 w-full rounded-full px-6 text-sm font-semibold disabled:opacity-50 sm:w-auto ${
          approved
            ? "border border-stone-300 text-red-700"
            : "bg-stone-900 text-white"
        }`}
        disabled={saving}
        onClick={handleClick}
        type="button"
      >
        {approved
          ? saving
            ? "Unapproving…"
            : "Unapprove"
          : saving
            ? "Approving…"
            : "Approve"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </li>
  );
}

function Creators({ approved }: { approved: boolean }) {
  const creators = useQuery(api.admin.listCreators, { approved });

  if (creators === undefined) {
    return <p className="mt-4 text-sm text-stone-600">Loading creators…</p>;
  }

  if (creators === null) {
    return (
      <p className="mt-4 text-sm text-stone-600">
        Please{" "}
        <Link
          className="inline-flex min-h-11 items-center font-semibold underline"
          href="/signin"
        >
          sign in
        </Link>{" "}
        as an admin to review creators.
      </p>
    );
  }

  if (creators.length === 0) {
    return (
      <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-stone-600">
        {approved ? "No approved creators yet." : "No creators are waiting."}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {creators.map((creator) => (
        <CreatorCard key={creator._id} approved={approved} creator={creator} />
      ))}
    </ul>
  );
}

export function CreatorReviewList() {
  const [approved, setApproved] = useState(false);

  return (
    <section className="mt-6">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            aria-pressed={approved === tab.approved}
            className={`min-h-11 flex-1 rounded-full px-6 text-sm font-semibold sm:flex-none ${
              approved === tab.approved
                ? "bg-stone-900 text-white"
                : "border border-stone-300"
            }`}
            onClick={() => setApproved(tab.approved)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Creators approved={approved} />
    </section>
  );
}
