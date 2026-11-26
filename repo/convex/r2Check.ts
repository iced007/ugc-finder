import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { headObject } from "./lib/r2";

/** Manual check: `npx convex run r2Check:ping`. 404 means signing worked. */
export const ping = internalAction({
  args: {},
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({ ok: v.literal(false), status: v.number() }),
  ),
  handler: async () => {
    const { status } = await headObject("healthcheck");
    if (status === 200 || status === 404) return { ok: true as const };
    return { ok: false as const, status };
  },
});
