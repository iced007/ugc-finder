import Link from "next/link";

type ProfileStatusCardProps = {
  role: "creator" | "brand";
  hasProfile: boolean;
};

export function ProfileStatusCard({ role, hasProfile }: ProfileStatusCardProps) {
  const href = `/${role}/profile`;
  const linkClass = "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold";

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">{hasProfile ? "Profile ready" : "Complete your profile"}</h2>
        <p className="mt-1 text-sm text-stone-600">
          {hasProfile
            ? "Your details are saved. You can update them any time."
            : role === "creator"
              ? "Add your bio, categories, price and social accounts so brands can find you."
              : "Add your business name, Facebook page and category to get started."}
        </p>
      </div>
      <Link className={hasProfile ? `${linkClass} border border-stone-300 text-stone-900 hover:border-stone-900` : `${linkClass} bg-emerald-700 text-white hover:bg-emerald-800`} href={href}>
        {hasProfile ? "Edit profile" : "Complete profile"}
      </Link>
    </section>
  );
}
