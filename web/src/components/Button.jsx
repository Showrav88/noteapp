export function Button({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 disabled:opacity-50';
  const variants = {
    primary: 'bg-brand-cyan text-brand-navy hover:brightness-95',
    secondary: 'border border-brand-border bg-white text-brand-navy hover:bg-white/80',
    danger: 'bg-brand-orange text-white hover:brightness-95',
    ghost: 'text-brand-navy hover:bg-brand-border/40',
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
