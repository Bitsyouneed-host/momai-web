import type { InputHTMLAttributes } from 'react';

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function StyledInput({ label, error, className = '', ...props }: StyledInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-white/90 border border-primary/30
          shadow-sm shadow-primary-dark/10
          text-text-primary placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all
          ${error ? 'border-error/50 focus:ring-error/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
