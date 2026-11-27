import { z } from "zod";

import {
  MAX_SOCIAL_ACCOUNTS,
  PRICE_MAX_TAKA,
  PRICE_MIN_TAKA,
} from "@/convex/lib/config";
import { CATEGORIES, PLATFORMS } from "@/convex/lib/validation";

const wholeNumber = (label: string) =>
  z
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} cannot be negative.`);

export const socialAccountSchema = z.object({
  platform: z.enum(PLATFORMS, { error: "Choose a platform." }),
  pageUrl: z
    .string()
    .trim()
    .refine((value) => {
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Use a link that starts with https://."),
  followerCount: wholeNumber("Followers"),
  avgViews: wholeNumber("Average views"),
});

export const creatorProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  bio: z
    .string()
    .trim()
    .min(1, "Add a short bio.")
    .max(1000, "Keep your bio under 1,000 characters."),
  categories: z
    .array(z.enum(CATEGORIES))
    .min(1, "Choose at least one category."),
  pricePerVideo: z
    .number({ error: "Enter a price in taka." })
    .int("Price must be a whole number of taka.")
    .min(PRICE_MIN_TAKA, `Minimum price is ${PRICE_MIN_TAKA} taka.`)
    .max(PRICE_MAX_TAKA, `Maximum price is ${PRICE_MAX_TAKA} taka.`),
  socialAccounts: z
    .array(socialAccountSchema)
    .max(MAX_SOCIAL_ACCOUNTS, `Add up to ${MAX_SOCIAL_ACCOUNTS} accounts.`),
});

export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
