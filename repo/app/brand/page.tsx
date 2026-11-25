import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function BrandPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "brand") {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Brand dashboard</h1>
      <Link href="/brand/profile">Your profile</Link>
      <SignOutButton />
    </main>
  );
}
