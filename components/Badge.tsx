const VARYANTLAR = {
  yesil: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  kirmizi: "bg-rose-50 text-rose-700 ring-rose-600/20",
  sari: "bg-amber-50 text-amber-700 ring-amber-600/20",
  gri: "bg-slate-100 text-slate-600 ring-slate-500/20",
  mavi: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
} as const;

export default function Badge({
  children,
  renk = "gri",
}: {
  children: React.ReactNode;
  renk?: keyof typeof VARYANTLAR;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${VARYANTLAR[renk]}`}
    >
      {children}
    </span>
  );
}
