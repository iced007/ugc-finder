// Plain TypeScript with no Convex imports, so the browser can import it too.

export const CATEGORIES = ["beauty", "food", "fashion", "gadgets", "baby"] as const;
export const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Platform = (typeof PLATFORMS)[number];

export function assertHttpsUrl(value: string, label = "Link"): void {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid https:// link.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must start with https://.`);
  }
}

export function assertNonNegativeInt(value: number, label = "Value"): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a whole number, 0 or more.`);
  }
}
