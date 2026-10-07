import { Pencil, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getCategoryInitial,
} from "../utils/format";

// One row showing a single transaction (used on dashboard + transactions page)
export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  showActions = true,
}) {
  const isIncome = transaction.type === "income";
  showActions = onDelete || onEdit ? true : false;
  return (
    <div className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      {/* Round icon with the first letter of the category */}
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-semibold ${isIncome ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
      >
        {getCategoryInitial(transaction.category)}
      </span>

      {/* Category + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {transaction.category}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDate(transaction.date)} <span className="mx-1">·</span>{" "}
          {isIncome ? "Income" : "Expense"}
        </p>
      </div>

      {/* Amount: +₹ for income, −₹ for expense */}
      <p
        className={`whitespace-nowrap text-sm font-semibold ${isIncome ? "text-emerald-700" : "text-slate-800"}`}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(transaction.amount)}
      </p>

      {showActions && (
        <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            aria-label="Edit transaction"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            aria-label="Delete transaction"
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
