"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/convex/lib/validation";
import { brandProfileSchema } from "@/lib/validation/brandProfile";

type SavedProfile = NonNullable<FunctionReturnType<typeof api.brandProfiles.getMine>>;
type FormErrors = { businessName?: string; facebookPageUrl?: string; category?: string };

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function BrandProfileForm() {
  const me = useQuery(api.users.me);
  const profile = useQuery(api.brandProfiles.getMine);

  if (me === undefined || profile === undefined) {
    return <p className="text-sm text-stone-600">Loading your profile…</p>;
  }

  if (me?.role !== "brand") {
    return (
      <Link className="text-sm font-semibold text-stone-950 underline underline-offset-4" href="/signin">
        Sign in as a brand
      </Link>
    );
  }

  return <BrandProfileFields profile={profile} />;
}

function BrandProfileFields({ profile }: { profile: SavedProfile | null }) {
  const upsertMine = useMutation(api.brandProfiles.upsertMine);

  const [businessName, setBusinessName] = useState(profile?.businessName ?? "");
  const [facebookPageUrl, setFacebookPageUrl] = useState(profile?.facebookPageUrl ?? "");
  const [category, setCategory] = useState(profile?.category ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setServerError(null);

    const result = brandProfileSchema.safeParse({ businessName, facebookPageUrl, category });
    if (!result.success) {
      const next: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "businessName" || field === "facebookPageUrl" || field === "category") {
          next[field] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await upsertMine(result.data);
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
          <h1 className="text-2xl font-bold tracking-tight text-stone-950">Your brand profile</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Tell creators who you are and what you sell.</p>
        </div>
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Business name</span>
            <input className={inputClass} onChange={(event) => setBusinessName(event.target.value)} value={businessName} />
            {errors.businessName && <span className="mt-1 block text-sm text-red-700">{errors.businessName}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">Facebook page link</span>
            <input className={inputClass} onChange={(event) => setFacebookPageUrl(event.target.value)} placeholder="https://facebook.com/..." type="url" value={facebookPageUrl} />
            {errors.facebookPageUrl && <span className="mt-1 block text-sm text-red-700">{errors.facebookPageUrl}</span>}
          </label>
          <fieldset>
            <legend className="text-sm font-semibold text-stone-800">Category</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button aria-pressed={category === item} className={`min-h-11 rounded-full border px-4 text-sm font-medium capitalize ${category === item ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white text-stone-700"}`} key={item} onClick={() => setCategory(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
            {errors.category && <span className="mt-1 block text-sm text-red-700">{errors.category}</span>}
          </fieldset>
        </div>
      </section>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button className="min-h-11 w-full rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto" disabled={saving} type="submit">{saving ? "Saving…" : "Save profile"}</button>
        {serverError && <p className="text-sm text-red-700">{serverError}</p>}
        {saved && <p className="text-sm font-medium text-emerald-700">Profile saved successfully.</p>}
      </div>
    </form>
  );
}
