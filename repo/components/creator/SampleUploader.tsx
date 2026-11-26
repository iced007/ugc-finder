"use client";

import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type ChangeEvent } from "react";

import { api } from "@/convex/_generated/api";
import {
  SAMPLE_CONTENT_TYPES,
  SAMPLE_MAX_BYTES,
  SAMPLE_MAX_SECONDS,
} from "@/convex/lib/config";

const MAX_MEGABYTES = SAMPLE_MAX_BYTES / (1024 * 1024);
const METADATA_TIMEOUT_MS = 15_000;
const UNREADABLE =
  "We could not read this video. Try saving it as an MP4 and choose it again.";

/** An error whose message is safe to show as it is. */
class UploadError extends Error {}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const timeout = window.setTimeout(() => finish(NaN), METADATA_TIMEOUT_MS);

    function finish(duration: number) {
      window.clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      URL.revokeObjectURL(url);

      if (Number.isFinite(duration) && duration > 0) resolve(duration);
      else reject(new UploadError(UNREADABLE));
    }

    video.preload = "metadata";
    video.onloadedmetadata = () => finish(video.duration);
    video.onerror = () => finish(NaN);
    video.src = url;
  });
}

// XMLHttpRequest, because fetch cannot report upload progress.
function putFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const fail = () =>
      reject(
        new UploadError(
          "The upload failed. Check your connection, delete the unfinished sample below and try again.",
        ),
      );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else fail();
    };
    request.onerror = fail;
    request.onabort = fail;
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.send(file);
  });
}

function messageFor(error: unknown): string {
  if (error instanceof ConvexError) return String(error.data);
  if (error instanceof UploadError) return error.message;
  return "Something went wrong. Please try again.";
}

export function SampleUploader({ atLimit }: { atLimit: boolean }) {
  const createUploadUrl = useAction(api.sampleActions.createUploadUrl);
  const confirmUpload = useAction(api.sampleActions.confirmUpload);
  // Null when idle.
  const [percent, setPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = percent !== null;

  async function upload(file: File) {
    if (!(SAMPLE_CONTENT_TYPES as readonly string[]).includes(file.type)) {
      throw new UploadError("Choose an MP4 or MOV video.");
    }
    if (file.size === 0) {
      throw new UploadError("This file is empty. Choose another video.");
    }
    if (file.size > SAMPLE_MAX_BYTES) {
      throw new UploadError(
        `The video must be ${MAX_MEGABYTES} MB or smaller. Compress it and try again.`,
      );
    }

    const durationSeconds = await readDuration(file);
    if (durationSeconds > SAMPLE_MAX_SECONDS) {
      throw new UploadError(
        `The video must be ${SAMPLE_MAX_SECONDS} seconds or shorter. Trim it and try again.`,
      );
    }

    const { sampleId, uploadUrl } = await createUploadUrl({
      contentType: file.type,
      sizeBytes: file.size,
      durationSeconds,
    });
    await putFile(uploadUrl, file, setPercent);
    await confirmUpload({ sampleId });
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError(null);
    setPercent(0);

    try {
      await upload(file);
    } catch (error) {
      console.error(error);
      setError(messageFor(error));
    } finally {
      setPercent(null);
      // So that choosing the same file again starts a new upload.
      input.value = "";
    }
  }

  // Stays visible at the limit while the last upload runs or has an error.
  if (atLimit && !busy && error === null) return null;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
      <label className="block">
        <span className="text-sm font-semibold text-stone-800">
          Add a sample video
        </span>
        <span className="mt-1 block text-sm leading-6 text-stone-600">
          MP4 or MOV, up to {SAMPLE_MAX_SECONDS} seconds and {MAX_MEGABYTES} MB.
          Compress large files first so they upload faster.
        </span>
        <input
          accept={SAMPLE_CONTENT_TYPES.join(",")}
          className="mt-3 block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:text-sm file:font-semibold file:text-white disabled:opacity-50"
          disabled={busy || atLimit}
          onChange={handleChange}
          type="file"
        />
      </label>
      {percent !== null && (
        <div className="mt-4">
          <progress
            aria-label="Upload progress"
            className="h-2 w-full accent-emerald-700"
            max={100}
            value={percent}
          />
          <p className="mt-1 text-sm text-stone-600">
            Uploading… {percent}%. Keep this page open.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
