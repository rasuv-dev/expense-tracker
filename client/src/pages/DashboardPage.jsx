import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { transactionApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import TransactionRow from "../components/TransactionRow";
import TransactionForm from "../components/TransactionForm";
import { formatCurrency } from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const res = await transactionApi.list();
      setTransactions(Array.isArray(res.transactions) ? res.transactions : []);
    } catch (err) {
      setError(`Unable to load your transactions. Errors: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  let income = 0,
    expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += Number(t.amount) || 0;
    if (t.type === "expense") expenses += Number(t.amount) || 0;
  }

  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.length - incomeCount;
  const balance = income - expenses;
  const recent = transactions.slice(0, 5);
  const firstName = (user?.name || "there").trim().split(/\s+/)[0];

  async function createTransaction(values) {
    setSaving(true);
    setFormError("");
    try {
      await transactionApi.create(values);
      setShowForm(false);
      setNotice("Transaction added successfully.");
      await loadTransactions();
    } catch (err) {
      setFormError(`Could not save this transaction. Errors: ${err}`);
    } finally {
      setSaving(false);
    }
  }

  function openForm() {
    setShowForm(true);
    setFormError("");
    setNotice("");
  }

  const stats = [
    ["Total balance", balance, "balance", "Income minus expenses"],
    ["Total income", income, "income", "Across all recorded transactions"],
    ["Total expenses", expenses, "expense", "Across all recorded transactions"],
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Good to see you, {firstName}.
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={openForm}
            className="px-3 py-2 text-sm font-semibold text-emerald-700"
          >
            Add transaction
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className="flex justify-between border-b border-emerald-200 py-3 text-sm text-emerald-800"
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
          className="flex justify-between border-b border-rose-200 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            onClick={loadTransactions}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, amount, kind, caption]) => (
          <StatCard
            key={label}
            label={label}
            value={loading ? "—" : formatCurrency(amount)}
            kind={kind}
            caption={caption}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="border border-slate-200 bg-white p-5 sm:p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Income</span>
              <strong>{loading ? "—" : formatCurrency(income)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Expenses</span>
              <strong>{loading ? "—" : formatCurrency(expenses)}</strong>
            </div>

            <div className="flex justify-between border-t pt-4">
              <span>Transactions</span>
              <strong>{loading ? "—" : transactions.length}</strong>
            </div>

            <div className="flex justify-between">
              <span>Income count</span>
              <strong>{incomeCount}</strong>
            </div>

            <div className="flex justify-between">
              <span>Expense count</span>
              <strong>{expenseCount}</strong>
            </div>
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-5 sm:p-6">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent transactions
              </h3>
              <p className="text-xs text-slate-500">
                Your latest money movements
              </p>
            </div>
            <Link
              to="/transactions"
              className="text-sm font-semibold text-emerald-700"
            >
              View all
            </Link>
          </header>

          <div className="mt-6 divide-y divide-slate-100">
            {loading ? (
              <p className="py-6 text-sm text-slate-500">
                Loading transactions...
              </p>
            ) : recent.length ? (
              recent.map((t) => <TransactionRow key={t._id} transaction={t} />)
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Nothing to show yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first transaction to see your financial picture take
                  shape.
                </p>
                <button
                  onClick={openForm}
                  className="mt-4 text-sm font-semibold text-emerald-700"
                >
                  Add a transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-transaction-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 sm:rounded-2xl sm:p-7 mx-4"
          >
            <h3
              id="new-transaction-title"
              className="text-xl font-bold text-slate-950"
            >
              Add a transaction
            </h3>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              Record income or an expense.
            </p>
            <TransactionForm
              onSubmit={createTransaction}
              onCancel={() => setShowForm(false)}
              saving={saving}
              submitError={formError}
            />
          </section>
        </div>
      )}
    </div>
  );
}
