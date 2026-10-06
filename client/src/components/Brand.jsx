import { WalletCards } from 'lucide-react';

// The app logo (icon + name). `light` = white version for the dark login screen.
export default function Brand({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${light ? 'bg-white/15 text-white' : 'bg-emerald-600 text-white'}`}>
        <WalletCards size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-slate-950'}`}>
          My Expense Tracker<span className={light ? 'text-emerald-300' : 'text-emerald-600'}>.</span>
        </span>
      )}
    </div>
  );
}
