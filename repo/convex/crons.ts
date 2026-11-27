import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";
import { SAMPLE_CLEANUP_INTERVAL_MINUTES } from "./lib/config";

const crons = cronJobs();

crons.interval(
  "remove stale pending samples",
  { minutes: SAMPLE_CLEANUP_INTERVAL_MINUTES },
  internal.samples.removeStalePending,
  {},
);

export default crons;
