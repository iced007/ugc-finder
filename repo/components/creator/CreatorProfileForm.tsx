"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { api } from "@/convex/_generated/api";
import {
  MAX_SOCIAL_ACCOUNTS,
  PRICE_MAX_TAKA,
  PRICE_MIN_TAKA,
} from "@/convex/lib/config";
import {
  CATEGORIES,
  PLATFORMS,
  type Category,
  type Platform,
} from "@/convex/lib/validation";
import { creatorProfileSchema } from "@/lib/validation/creatorProfile";

type SocialAccount = { platform: Platform; pageUrl: string; followerCount: string; avgViews: string };
type FormErrors = {
  displayName?: string;
  bio?: string;
  categories?: string;
  pricePerVideo?: string;
  socialAccounts?: string;
  socialFields: Record<number, string>;
};

const emptySocialAccount = (): SocialAccount => ({
  platform: "facebook",
  pageUrl: "",
  followerCount: "",
  avgViews: "",
});

// Empty or non-numeric text becomes NaN so Zod reports it; "12.5" stays 12.5 and fails the integer rule.
function toNumber(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function initialErrors(): FormErrors {
  return { socialFields: {} };
}

type SavedProfile = NonNullable<FunctionReturnType<typeof api.creatorProfiles.getMine>>;

export function CreatorProfileForm() {
  const me = useQuery(api.users.me);
  const profile = useQuery(api.creatorProfiles.getMine);

  if (me === undefined || profile === undefined) {
    return <p className="text-sm text-stone-600">Loading your profile…</p>;
  }

  if (me?.role !== "creator") {
    return (
      <Link className="text-sm font-semibold text-stone-950 underline underline-offset-4" href="/signin">
        Sign in as a creator
      </Link>
    );
  }

  return <ProfileFormFields profile={profile} />;
}

function ProfileFormFields({ profile }: { profile: SavedProfile | null }) {
  const upsertMine = useMutation(api.creatorProfiles.upsertMine);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [categories, setCategories] = useState<Category[]>((profile?.categories ?? []) as Category[]);
  const [pricePerVideo, setPricePerVideo] = useState(profile ? String(profile.pricePerVideo) : "");
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    (profile?.socialAccounts ?? []).map((account) => ({
      platform: account.platform as Platform,
      pageUrl: account.pageUrl,
      followerCount: String(account.followerCount),
      avgViews: String(account.avgViews),
    })),
  );
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function parse() {
    const result = creatorProfileSchema.safeParse({
      displayName,
      bio,
      categories,
      pricePerVideo: toNumber(pricePerVideo),
      socialAccounts: socialAccounts.map((account) => ({
        platform: account.platform,
        pageUrl: account.pageUrl,
        followerCount: toNumber(account.followerCount),
        avgViews: toNumber(account.avgViews),
      })),
    });
    const nextErrors = initialErrors();

    if (result.success) {
      setErrors(nextErrors);
      return result.data;
    }

    for (const issue of result.error.issues) {
      const [field, index, sub] = issue.path;
      if (field === "socialAccounts" && typeof index === "number") {
        const label = sub === "pageUrl" ? "Page URL" : sub === "followerCount" ? "Followers" : sub === "avgViews" ? "Average views" : "Platform";
        const previous = nextErrors.socialFields[index];
        nextErrors.socialFields[index] = `${previous ? `${previous} ` : ""}${label}: ${issue.message}`;
      } else if (field === "socialAccounts") {
        nextErrors.socialAccounts = issue.message;
      } else if (field === "displayName" || field === "bio" || field === "categories" || field === "pricePerVideo") {
        nextErrors[field] ??= issue.message;
      }
    }
    if (Object.keys(nextErrors.socialFields).length) nextErrors.socialAccounts ??= "Fix the social account details below.";
    setErrors(nextErrors);
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setServerError(null);
    const data = parse();
    if (!data) return;

    setSaving(true);
    try {
      await upsertMine(data);
      setSaved(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-950">Your creator profile</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Help brands understand what you make and what it costs to work with you.</p>
        </div>
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Display name</span>
            <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
            {errors.displayName && <span className="mt-1 block text-sm text-red-700">{errors.displayName}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Bio</span>
            <textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBio(event.target.value)} value={bio} />
            {errors.bio && <span className="mt-1 block text-sm text-red-700">{errors.bio}</span>}
          </label>
          <fieldset>
            <legend className="text-sm font-semibold text-stone-800">Categories</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button className={`min-h-11 rounded-full border px-4 text-sm font-medium capitalize ${categories.includes(category) ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white text-stone-700"}`} key={category} onClick={() => setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} type="button">
                  {category}
                </button>
              ))}
            </div>
            {errors.categories && <span className="mt-1 block text-sm text-red-700">{errors.categories}</span>}
          </fieldset>
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Price per video (taka)</span>
            <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" inputMode="numeric" max={PRICE_MAX_TAKA} min={PRICE_MIN_TAKA} step={1} onChange={(event) => setPricePerVideo(event.target.value)} type="number" value={pricePerVideo} />
            {errors.pricePerVideo && <span className="mt-1 block text-sm text-red-700">{errors.pricePerVideo}</span>}
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-950">Social accounts</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">Add up to four accounts brands can review.</p>
          </div>
          <button className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-semibold disabled:opacity-50" disabled={socialAccounts.length >= MAX_SOCIAL_ACCOUNTS} onClick={() => setSocialAccounts((current) => [...current, emptySocialAccount()])} type="button">Add account</button>
        </div>
        {socialAccounts.length === 0 && <p className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">No social accounts added yet.</p>}
        <div className="mt-6 space-y-5">
          {socialAccounts.map((account, index) => (
            <div className="rounded-2xl border border-stone-200 p-4 sm:p-5" key={`${index}-${account.platform}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-stone-900">Account {index + 1}</h3>
                <button className="text-sm font-semibold text-red-700" onClick={() => setSocialAccounts((current) => current.filter((_, accountIndex) => accountIndex !== index))} type="button">Remove</button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-stone-800">Platform</span>
                  <select className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm capitalize outline-none focus:border-emerald-700" onChange={(event) => setSocialAccounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, platform: event.target.value as Platform } : item))} value={account.platform}>
                    {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-stone-800">Page URL</span>
                  <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700" onChange={(event) => setSocialAccounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, pageUrl: event.target.value } : item))} placeholder="https://..." type="url" value={account.pageUrl} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-stone-800">Followers</span>
                  <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700" inputMode="numeric" onChange={(event) => setSocialAccounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, followerCount: event.target.value } : item))} type="number" value={account.followerCount} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-stone-800">Average views</span>
                  <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700" inputMode="numeric" onChange={(event) => setSocialAccounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, avgViews: event.target.value } : item))} type="number" value={account.avgViews} />
                </label>
              </div>
              {errors.socialFields[index] && <p className="mt-3 text-sm text-red-700">{errors.socialFields[index]}</p>}
            </div>
          ))}
        </div>
        {errors.socialAccounts && <p className="mt-3 text-sm text-red-700">{errors.socialAccounts}</p>}
      </section>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button className="min-h-11 w-full rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto" disabled={saving} type="submit">{saving ? "Saving…" : "Save profile"}</button>
        {serverError && <p className="text-sm text-red-700">{serverError}</p>}
        {saved && <p className="text-sm font-medium text-emerald-700">Profile saved successfully.</p>}
      </div>
    </form>
  );
}
