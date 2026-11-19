"use client";

import { FormEvent, useState } from "react";

const CATEGORIES = ["beauty", "food", "fashion", "gadgets", "baby"] as const;
const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube"] as const;
const PRICE_MIN_TAKA = 500;
const PRICE_MAX_TAKA = 100000;
const MAX_SOCIAL_ACCOUNTS = 4;

type Category = (typeof CATEGORIES)[number];
type Platform = (typeof PLATFORMS)[number];
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

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isNonNegativeInteger(value: string) {
  return /^\d+$/.test(value);
}

function initialErrors(): FormErrors {
  return { socialFields: {} };
}

export function CreatorProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricePerVideo, setPricePerVideo] = useState("");
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [saved, setSaved] = useState(false);

  function validate() {
    const nextErrors = initialErrors();
    const numericPrice = Number(pricePerVideo);

    if (displayName.trim().length < 2 || displayName.trim().length > 80) {
      nextErrors.displayName = "Use a name between 2 and 80 characters.";
    }
    if (!bio.trim()) nextErrors.bio = "Add a short bio.";
    if (categories.length === 0) nextErrors.categories = "Choose at least one category.";
    if (!Number.isInteger(numericPrice) || numericPrice < PRICE_MIN_TAKA || numericPrice > PRICE_MAX_TAKA) {
      nextErrors.pricePerVideo = `Enter an integer from ${PRICE_MIN_TAKA.toLocaleString()} to ${PRICE_MAX_TAKA.toLocaleString()} taka.`;
    }

    socialAccounts.forEach((account, index) => {
      const fieldErrors: string[] = [];
      if (!isHttpsUrl(account.pageUrl.trim())) fieldErrors.push("Use an HTTPS page URL.");
      if (!isNonNegativeInteger(account.followerCount)) fieldErrors.push("Followers must be a non-negative integer.");
      if (!isNonNegativeInteger(account.avgViews)) fieldErrors.push("Average views must be a non-negative integer.");
      if (fieldErrors.length) nextErrors.socialFields[index] = fieldErrors.join(" ");
    });
    if (Object.keys(nextErrors.socialFields).length) nextErrors.socialAccounts = "Fix the social account details below.";

    setErrors(nextErrors);
    return !nextErrors.displayName && !nextErrors.bio && !nextErrors.categories && !nextErrors.pricePerVideo && !nextErrors.socialAccounts;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(validate());
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
            <input className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" inputMode="numeric" min={PRICE_MIN_TAKA} onChange={(event) => setPricePerVideo(event.target.value)} type="number" value={pricePerVideo} />
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
        <button className="min-h-11 w-full rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white sm:w-auto" type="submit">Save profile</button>
        {saved && <p className="text-sm font-medium text-emerald-700">Profile saved successfully.</p>}
      </div>
    </form>
  );
}
