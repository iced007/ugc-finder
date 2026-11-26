"use client";

import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useState } from "react";

import { SampleUploader } from "@/components/creator/SampleUploader";
import { SignedVideo } from "@/components/video/SignedVideo";
import { api } from "@/convex/_generated/api";
import { MAX_SAMPLES_PER_CREATOR } from "@/convex/lib/config";

type Sample = NonNullable<
  FunctionReturnType<typeof api.samples.listMine>
>[number];

function SampleCard({ sample }: { sample: Sample }) {
  const deleteSample = useAction(api.sampleActions.deleteSample);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setDeleting(true);

    try {
      await deleteSample({ sampleId: sample._id });
    } catch (error) {
      console.error(error);
      setError(
        error instanceof ConvexError
          ? String(error.data)
          : "We could not delete this sample. Please try again.",
      );
      setDeleting(false);
    }
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      {/* Keyed by status, so the player reloads once the upload is ready. */}
      <SignedVideo key={sample.status} sampleId={sample._id} />
      <div className="mt-3 flex items-center justify-between gap-2 text-sm text-stone-600">
        <span>
          {new Date(sample.createdAt).toLocaleDateString("en-GB")} ·{" "}
          {Math.round(sample.durationSeconds)} s
        </span>
        {sample.status === "pending" && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Processing
          </span>
        )}
      </div>
      {confirming ? (
        <div className="mt-3">
          <p className="text-sm font-semibold">Are you sure?</p>
          <div className="mt-2 flex gap-2">
            <button
              className="min-h-11 flex-1 rounded-full bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={deleting}
              onClick={handleDelete}
              type="button"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              className="min-h-11 flex-1 rounded-full border border-stone-300 px-4 text-sm font-semibold disabled:opacity-50"
              disabled={deleting}
              onClick={() => setConfirming(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="mt-3 min-h-11 w-full rounded-full border border-stone-300 px-4 text-sm font-semibold text-red-700"
          onClick={() => setConfirming(true)}
          type="button"
        >
          Delete
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </li>
  );
}

export function SampleList() {
  const samples = useQuery(api.samples.listMine);

  if (samples === undefined) {
    return <p className="mt-6 text-sm text-stone-600">Loading samples…</p>;
  }

  if (samples === null) {
    return (
      <p className="mt-6 text-sm text-stone-600">
        Please{" "}
        <Link
          className="inline-flex min-h-11 items-center font-semibold underline"
          href="/signin"
        >
          sign in
        </Link>{" "}
        as a creator to manage samples.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm text-stone-600">
        {samples.length} of {MAX_SAMPLES_PER_CREATOR} samples
      </p>
      <SampleUploader atLimit={samples.length >= MAX_SAMPLES_PER_CREATOR} />
      {samples.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-stone-600">
          No samples yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((sample) => (
            <SampleCard key={sample._id} sample={sample} />
          ))}
        </ul>
      )}
    </div>
  );
}
