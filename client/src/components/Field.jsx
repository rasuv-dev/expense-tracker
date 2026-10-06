// A reusable labelled input. Usage:
//   <Field label="Email" name="email" type="email" value={...} onChange={...} error={...} />
export default function Field({ label, error, hint, id, ...props }) {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
