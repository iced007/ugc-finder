import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { SampleList } from "@/components/creator/SampleList";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export const instant = false;

export default async function CreatorSamplesPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const token = accessToken ?? undefined;
  const user = await fetchQuery(api.users.me, {}, { token });

  if (user?.role !== "creator") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell role="creator">
      <h1 className="text-2xl font-semibold">Samples</h1>
      <SampleList />
    </DashboardShell>
  );
}
