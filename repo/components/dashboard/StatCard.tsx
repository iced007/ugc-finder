type StatCardProps = {
  label: string;
  value: string;
  badge?: { text: string; tone: "done" | "pending" | "empty" };
};

const BADGE_TONES = {
  done: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  empty: "bg-stone-100 text-stone-600",
} as const;

export function StatCard({ label, value, badge }: StatCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
        {badge && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[badge.tone]}`}>{badge.text}</span>}
      </div>
      <p className="mt-2 break-words text-lg font-semibold text-stone-900">{value}</p>
    </div>
  );
}
