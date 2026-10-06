import { useState } from "react";
import { CalendarDays, Check, X } from "lucide-react";
import Field from "./Field";
import { localDateValue } from "../utils/format";

// Suggestions shown in the category input
const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Salary",
  "Freelance",
  "Education",
  "Travel",
  "Other",
];


export default function TransactionForm({
  initialValue,
  onSubmit,
  onCancel,
  saving = false,
  submitError = "",
}) {
  const [type, setType] = useState(initialValue?.type || "expense");
  const [amount, setAmount] = useState(
    initialValue ? String(initialValue.amount) : "",
  );
  const [category, setCategory] = useState(initialValue?.category || "");
  const [date, setDate] = useState(
    initialValue?.date
      ? localDateValue(initialValue.date)
      : localDateValue(new Date()),
  );
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();

    // Validate the form
    const nextErrors = {};
    const numericAmount = Number(amount);
    if (!amount || !Number.isFinite(numericAmount) || numericAmount < 0.01)
      nextErrors.amount = "Enter an amount of at least 0.01.";
    if (!category.trim()) nextErrors.category = "Choose or enter a category.";
    if (!date) nextErrors.date = "Choose a date.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return; // stop if there are errors

    // Send the values to the parent page
    await onSubmit({
      type,
      amount: numericAmount,
      category: category.trim(),
      date,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Expense / Income switch */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Transaction type
        </p>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${type === "income" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Income
          </button>
        </div>
      </div>

      <Field
        label="Amount"
        name="amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        autoFocus
      />

      {/* Free text input with category suggestions */}
      <div className="space-y-1.5">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-slate-700"
        >
          Category
        </label>
        <input
          id="category"
          list="transaction-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Groceries"
          maxLength={80}
          className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${errors.category ? "border-rose-300" : "border-slate-200"}`}
        />
        <datalist id="transaction-categories">
          {categories.map((item) => (
            <option value={item} key={item} />
          ))}
        </datalist>
        {errors.category && (
          <p className="text-xs text-rose-600">{errors.category}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700"
        >
          Date
        </label>
        <div className="relative">
          <CalendarDays
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        {errors.date && <p className="text-xs text-rose-600">{errors.date}</p>}
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
        >
          {submitError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={16} className="mr-2 inline" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check size={16} className="mr-2 inline" />
              {initialValue ? "Save changes" : "Add transaction"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
