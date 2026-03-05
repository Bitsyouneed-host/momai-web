import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  isLoading,
  fullWidth = true,
  disabled,
  className = '',
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        font-semibold text-white py-4 px-6 rounded-xl
        transition-all duration-150 active:scale-[0.98]
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary-dark/30 hover:shadow-xl'
        }
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}
