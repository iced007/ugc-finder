import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { CreatorReviewList } from "@/components/admin/CreatorReviewList";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function AdminPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <SignOutButton />
      </div>
      <CreatorReviewList />
    </main>
  );
}
