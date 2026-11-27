"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { APP_NAME } from "@/lib/config";

type DashboardShellProps = {
  role: "creator" | "brand";
  children: ReactNode;
};

const ROLE_LABELS = { creator: "Creator", brand: "Brand" } as const;

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const links = [
    { href: `/${role}`, label: "Dashboard" },
    { href: `/${role}/profile`, label: "Profile" },
    ...(role === "creator" ? [{ href: "/creator/samples", label: "Samples" }] : []),
    ...(role === "brand" ? [{ href: "/creators", label: "Find creators" }] : []),
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{APP_NAME}</p>
            <p className="text-xs font-medium text-emerald-700">{ROLE_LABELS[role]} account</p>
          </div>
          <SignOutButton />
        </div>
        <nav aria-label="Dashboard" className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors ${active ? "bg-emerald-700 text-white" : "text-stone-700 hover:bg-stone-100"}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
