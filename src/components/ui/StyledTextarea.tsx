import type { TextareaHTMLAttributes } from 'react';

interface StyledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function StyledTextarea({ label, error, className = '', ...props }: StyledTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3.5 rounded-xl min-h-[80px]
          bg-white/90 border border-primary/30
          shadow-sm shadow-primary-dark/10
          text-text-primary placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all resize-y
          ${error ? 'border-error/50 focus:ring-error/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
