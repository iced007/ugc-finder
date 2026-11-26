"use client";

import { useAction, useConvexAuth } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Playback = { url: string; attempt: number } | { error: string };

const PLAYBACK_FAILED = "Could not play this video. Reload the page to retry.";

function Player({ sampleId }: { sampleId: Id<"sampleVideos"> }) {
  const getPlaybackUrl = useAction(api.sampleActions.getPlaybackUrl);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retried = useRef(false);

  useEffect(() => {
    // Wait for auth, or an owner would be treated as signed out.
    if (isLoading) return;
    let cancelled = false;

    getPlaybackUrl({ sampleId }).then(
      ({ url }) => {
        if (!cancelled) setPlayback({ url, attempt });
      },
      (error: unknown) => {
        if (cancelled) return;
        setPlayback({
          error:
            error instanceof ConvexError ? String(error.data) : PLAYBACK_FAILED,
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [getPlaybackUrl, sampleId, isLoading, isAuthenticated, attempt]);

  // The URL may have expired, so ask for a fresh one, but only once.
  function handleError() {
    if (retried.current) {
      setPlayback({ error: PLAYBACK_FAILED });
      return;
    }
    retried.current = true;
    setAttempt((current) => current + 1);
  }

  if (playback === null || "error" in playback) {
    return (
      <div
        role="status"
        className="flex aspect-[9/16] w-full items-center justify-center rounded-lg bg-neutral-100 p-4 text-center text-sm text-neutral-600"
      >
        {playback === null ? "Loading video…" : playback.error}
      </div>
    );
  }

  return (
    <video
      // A new element per attempt, so a retry reloads even if the URL repeats.
      key={playback.attempt}
      src={playback.url}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onError={handleError}
      className="aspect-[9/16] w-full rounded-lg bg-black"
    />
  );
}

export function SignedVideo({ sampleId }: { sampleId: Id<"sampleVideos"> }) {
  // Keyed so that a different sample starts with fresh state.
  return <Player key={sampleId} sampleId={sampleId} />;
}
