export function Input({ label, id, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1 block font-medium text-brand-navy">{label}</span> : null}
      <input
        id={id}
        className={`w-full rounded-md border border-brand-border bg-white px-3 py-2 text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 ${className}`}
        {...props}
      />
    </label>
  );
}

export function TextArea({ label, id, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1 block font-medium text-brand-navy">{label}</span> : null}
      <textarea
        id={id}
        rows={4}
        className={`w-full rounded-md border border-brand-border bg-white px-3 py-2 text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 ${className}`}
        {...props}
      />
    </label>
  );
}
