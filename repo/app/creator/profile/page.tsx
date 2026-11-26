import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { CreatorProfileForm } from "@/components/creator/CreatorProfileForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function CreatorProfilePage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "creator") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell role="creator">
      <div className="mx-auto w-full max-w-3xl">
        <CreatorProfileForm />
      </div>
    </DashboardShell>
  );
}
