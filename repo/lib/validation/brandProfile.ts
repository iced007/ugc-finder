import { z } from "zod";

import { CATEGORIES } from "@/convex/lib/validation";

export const brandProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  facebookPageUrl: z
    .string()
    .trim()
    .refine((value) => {
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Use a link that starts with https://."),
  category: z.enum(CATEGORIES, { error: "Choose a category." }),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;
