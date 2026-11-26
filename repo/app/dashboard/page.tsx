import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";
export const instant = false;
export default async function DashboardPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user === null) {
    redirect("/signin");
  }

  if (user.role === undefined) {
    redirect("/onboarding");
  }

  redirect(`/${user.role}`);
}
