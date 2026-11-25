import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function CreatorPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "creator") {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Creator dashboard</h1>
      <Link href="/creator/profile">Your profile</Link>
      <SignOutButton />
    </main>
  );
}
