import { useEffect, useState } from "react";
import {
  ArrowDownUp,
  CirclePlus,
  ReceiptText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { transactionApi } from "../api/client";
import TransactionForm from "../components/TransactionForm";
import TransactionRow from "../components/TransactionRow";
import { formatCurrency, getApiErrorMessage } from "../utils/format";

export default function TransactionsPage() {
  // Data from the server
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter / search state
  const [query, setQuery] = useState(""); // search text
  const [typeFilter, setTypeFilter] = useState("all"); // all | income | expense
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  // Add / edit popup state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // transaction being edited (null = adding new)
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete popup state
  const [deleteTarget, setDeleteTarget] = useState(null); // transaction to delete (null = popup closed)
  const [deleting, setDeleting] = useState(false);

  const [notice, setNotice] = useState(""); // green "success" banner

  // Load transactions from the server once when the page opens
  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const response = await transactionApi.list();
      setTransactions(
        Array.isArray(response.transactions) ? response.transactions : [],
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load transactions."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
    // Run ONCE on page open - the array is intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Filtering + sorting (recomputed on every render - simple & fine for small lists) ---
  const searchText = query.trim().toLowerCase();
  const filtered = transactions
    .filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesQuery =
        !searchText ||
        (item.category || "").toLowerCase().includes(searchText) ||
        item.type.includes(searchText);
      return matchesType && matchesQuery;
    })
    .sort((a, b) => {
      const difference =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });

  let income = 0;
  let expenses = 0;
  for (const item of filtered) {
    if (item.type === "income") income += Number(item.amount) || 0;
    if (item.type === "expense") expenses += Number(item.amount) || 0;
  }

  // Open the popup in "add new" mode
  function openCreate() {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  }

  // Open the popup in "edit" mode with this transaction's data
  function openEdit(transaction) {
    setEditing(transaction);
    setFormError("");
    setFormOpen(true);
  }

  // Called by TransactionForm when the user submits valid values
  async function saveTransaction(values) {
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        // Send only the fields that actually changed
        const changed = {};
        for (const key of ["type", "amount", "category", "date"]) {
          const previous =
            key === "date"
              ? String(editing[key] || "").slice(0, 10)
              : editing[key];
          if (values[key] !== previous) changed[key] = values[key];
        }
        if (Object.keys(changed).length) {
          await transactionApi.update(editing._id, changed);
          setNotice("Transaction updated.");
        } else {
          setNotice("No changes to save.");
        }
      } else {
        await transactionApi.create(values);
        setNotice("Transaction added.");
      }
      setFormOpen(false);
      setEditing(null);
      await loadTransactions();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not save this transaction."));
    } finally {
      setSaving(false);
    }
  }

  // Called when the user confirms deletion in the popup
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await transactionApi.remove(deleteTarget._id);
      setNotice("Transaction deleted.");
      setDeleteTarget(null);
      await loadTransactions();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete this transaction."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  // Grey placeholder rows shown while loading
  function SkeletonRows() {
    return (
      <div className="space-y-5 py-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex animate-pulse items-center gap-3">
            <div className="size-11 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-slate-100" />
              <div className="h-2.5 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  // Message shown when the list is empty
  function EmptyState() {
    return (
      <div className="flex flex-col items-center px-4 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-slate-50 text-slate-400">
          <ReceiptText size={24} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          {transactions.length
            ? "No matching transactions"
            : "No transactions yet"}
        </p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
          {transactions.length
            ? "Try changing your search or filters."
            : "Add your first transaction to start keeping track."}
        </p>
        {!transactions.length && (
          <button
            onClick={openCreate}
            className="mt-4 text-sm font-semibold text-emerald-700"
          >
            Add a transaction
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page title + add button */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Your money activity
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            All transactions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Review, organize, and update your records.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <CirclePlus size={17} />
          Add transaction
        </button>
      </section>

      {/* Banners */}
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="font-semibold">
            Dismiss
          </button>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center"
        >
          <span>{error}</span>
          <button
            onClick={loadTransactions}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Three small summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Matching transactions
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? "—" : filtered.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Income in view</p>
          <p className="mt-2 text-xl font-bold text-emerald-700">
            {loading ? "—" : formatCurrency(income)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Expenses in view</p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {loading ? "—" : formatCurrency(expenses)}
          </p>
        </div>
      </section>

      {/* Main card: filters + list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/30">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Find a transaction
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_160px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search category or type…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="all">All types</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowDownUp size={16} />
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-5">
          {/* Column headings (desktop only) */}
          <div className="hidden grid-cols-[minmax(0,1fr)_150px_130px] gap-4 border-b border-slate-100 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Transaction</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>

          {loading ? (
            <SkeletonRows />
          ) : filtered.length ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((transaction) => (
                <div
                  key={transaction._id}
                  className="grid items-center gap-1 sm:grid-cols-[minmax(0,1fr)_150px_130px]"
                >
                  <div className="min-w-0">
                    <TransactionRow
                      transaction={transaction}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                      showActions
                    />
                  </div>
                  <p className="hidden text-sm text-slate-500 sm:block">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(transaction.date))}
                  </p>
                  <p className="hidden text-right text-sm font-semibold sm:block">
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-emerald-700"
                          : "text-slate-800"
                      }
                    >
                      {transaction.type === "income" ? "+" : "−"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <span>
            Showing {loading ? "…" : filtered.length} of{" "}
            {loading ? "…" : transactions.length} transactions
          </span>
          <span>Newest records load first</span>
        </div>
      </section>

      {/* Add / edit popup (only rendered when formOpen is true) */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setFormOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-dialog-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
          >
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Transaction
              </p>
              <h3
                id="transaction-dialog-title"
                className="mt-2 text-xl font-bold text-slate-950"
              >
                {editing ? "Edit transaction" : "Add a transaction"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {editing
                  ? "Update the details below."
                  : "Record income or an expense."}
              </p>
            </div>
            {/* key=... forces the form to fully reset when switching between add/edit */}
            <TransactionForm
              key={editing?._id || "new"}
              initialValue={editing}
              onSubmit={saveTransaction}
              onCancel={() => {
                setFormOpen(false);
                setEditing(null);
              }}
              saving={saving}
              submitError={formError}
            />
          </section>
        </div>
      )}

      {/* Delete confirmation popup (only rendered when deleteTarget is set) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <ReceiptText size={20} />
            </div>
            <h3
              id="delete-title"
              className="mt-4 text-lg font-bold text-slate-950"
            >
              Delete transaction?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete the{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.category}
              </span>{" "}
              transaction for {formatCurrency(deleteTarget.amount)}.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
