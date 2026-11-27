// Limits, timers and money rules. Plain TypeScript so client code can import it.
// See docs/v2/tech-stack.md section 4.

export const PRICE_MIN_TAKA = 500;
export const PRICE_MAX_TAKA = 100000;
export const MAX_SOCIAL_ACCOUNTS = 4;

export const SAMPLE_MAX_BYTES = 100 * 1024 * 1024;
export const SAMPLE_MAX_SECONDS = 90;
export const SAMPLE_CONTENT_TYPES = ["video/mp4", "video/quicktime"] as const;
export const MAX_SAMPLES_PER_CREATOR = 6;

export const UPLOAD_URL_TTL_SECONDS = 600;
export const PLAYBACK_URL_TTL_SECONDS = 300;

// Must be more than UPLOAD_URL_TTL_SECONDS, or a live upload could be removed.
export const SAMPLE_PENDING_MAX_AGE_SECONDS = 3600;
export const SAMPLE_CLEANUP_INTERVAL_MINUTES = 60;
export const SAMPLE_CLEANUP_BATCH_SIZE = 50;

export const DIRECTORY_PAGE_SIZE = 12;
export const DIRECTORY_SCAN_LIMIT = 500;
