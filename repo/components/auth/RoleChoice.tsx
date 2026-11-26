"use client";

import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";

const choices = [
  {
    role: "creator" as const,
    label: "I'm a creator",
    description: "Show your work and get hired by brands.",
  },
  {
    role: "brand" as const,
    label: "I'm a brand",
    description: "Find creators for your next campaign.",
  },
];

export function RoleChoice() {
  const router = useRouter();
  const setRole = useMutation(api.users.setRole);
  const [pendingRole, setPendingRole] = useState<"creator" | "brand" | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function chooseRole(role: "creator" | "brand") {
    setError(null);
    setPendingRole(role);

    try {
      await setRole({ role });
    } catch (error) {
      console.error(error);
      setError("We couldn't save your role. Please try again.");
      setPendingRole(null);
      return;
    }

    setPendingRole(null);
    setSaved(true);
    router.push("/dashboard");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-950">
          How will you use UGC Marketplace?
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Choose the role that fits you. This can&apos;t be changed later.
        </p>
      </div>

      <div className="grid gap-3">
        {choices.map((choice) => (
          <button
            className="min-h-28 rounded-xl border border-stone-300 bg-white px-5 py-4 text-left transition-colors hover:border-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-stone-100"
            disabled={pendingRole !== null || saved}
            key={choice.role}
            onClick={() => chooseRole(choice.role)}
            type="button"
          >
            <span className="block text-lg font-semibold text-stone-950">
              {pendingRole === choice.role ? "Saving…" : choice.label}
            </span>
            <span className="mt-1 block text-sm leading-6 text-stone-600">
              {choice.description}
            </span>
          </button>
        ))}
      </div>

      {saved ? (
        <p className="text-sm font-medium text-emerald-700" role="status">
          Role saved.{" "}
          <Link className="underline underline-offset-4" href="/dashboard">
            Continue to your dashboard
          </Link>
        </p>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
