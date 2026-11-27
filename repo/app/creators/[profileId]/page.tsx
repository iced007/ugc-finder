import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { Header } from "@/components/landing/Header";
import { SignedVideo } from "@/components/video/SignedVideo";
import { api } from "@/convex/_generated/api";
import { APP_NAME } from "@/lib/config";

type Props = { params: Promise<{ profileId: string }> };

// Cached per request, so the page and its metadata share one query.
const getCreator = cache(async (profileId: string) => {
  // The Convex client uses Math.random(), so this must wait for a request.
  await connection();
  return fetchQuery(api.creators.getPublic, { profileId });
});

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profileId } = await params;
  const creator = await getCreator(profileId);

  if (creator === null) {
    return {};
  }

  return { title: `${creator.displayName} on ${APP_NAME}` };
}

export default async function CreatorPage({ params }: Props) {
  const { profileId } = await params;
  const creator = await getCreator(profileId);

  if (creator === null) {
    notFound();
  }

  // Light colors to match the header, whatever the system theme is.
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 wrap-anywhere sm:px-8">
        <section className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {creator.displayName}
          </h1>
          <ul aria-label="Categories" className="flex flex-wrap gap-2">
            {creator.categories.map((category) => (
              <li
                key={category}
                className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700 capitalize"
              >
                {category}
              </li>
            ))}
          </ul>
          <p className="whitespace-pre-line text-stone-700">{creator.bio}</p>
          <p className="text-lg font-semibold">
            ৳{formatNumber(creator.pricePerVideo)} per video
          </p>
          <button
            type="button"
            disabled
            className="min-h-11 w-full cursor-not-allowed rounded-lg bg-stone-200 px-5 text-sm font-semibold text-stone-600 sm:w-auto"
          >
            Hire this creator (Coming soon)
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Social accounts</h2>
          {creator.socialAccounts.length === 0 ? (
            <p className="text-sm text-stone-600">No social accounts yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {creator.socialAccounts.map((account, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-stone-200 p-4"
                >
                  <a
                    href={account.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-semibold capitalize underline underline-offset-4"
                  >
                    {account.platform}
                  </a>
                  <p className="text-sm text-stone-600">
                    {formatNumber(account.followerCount)} followers ·{" "}
                    {formatNumber(account.avgViews)} average views
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Samples</h2>
          {creator.sampleIds.length === 0 ? (
            <p className="text-sm text-stone-600">No samples yet.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3">
              {creator.sampleIds.map((sampleId) => (
                <li key={sampleId}>
                  <SignedVideo sampleId={sampleId} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
