import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

// Pick icon and colors based on which kind of card we show
const icons = { income: ArrowDownLeft, expense: ArrowUpRight, balance: Wallet };
const tones = {
  income: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-rose-50 text-rose-600',
  balance: 'bg-indigo-50 text-indigo-600',
};

// One summary card on the dashboard, e.g. "Total balance — ₹12,000"
export default function StatCard({ label, value, kind, caption }) {
  const Icon = icons[kind] || Wallet;
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[kind] || tones.balance}`}>
          <Icon size={21} />
        </span>
      </div>
      {caption && <p className="mt-4 text-xs text-slate-500">{caption}</p>}
    </section>
  );
}
