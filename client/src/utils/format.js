// Small helper functions used across the app.

const currency = import.meta.env.VITE_CURRENCY || 'INR';

// 1234.5 -> "₹1,234.50"
export function formatCurrency(value) {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// "2026-10-04T00:00:00" -> "4 Oct 2026"
export function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

// Turns a Date into "YYYY-MM-DD" for <input type="date">
export function localDateValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// "Groceries" -> "G"  (letter shown in the round icon of a transaction row)
export function getCategoryInitial(category) {
  return (category || 'T').trim().charAt(0).toUpperCase() || 'T';
}

// Turns any error from apiRequest into a friendly message for the user
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback;
}

// The server can send field errors like [{ field: 'email', message: '...' }].
// This converts them into an object like { email: '...' } for easy lookup.
export function getFieldErrors(error) {
  const result = {};
  for (const item of error?.errors || []) {
    if (item?.field && item?.message) result[item.field] = item.message;
  }
  return result;
}
