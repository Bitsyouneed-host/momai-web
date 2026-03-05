import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function SecondaryButton({
  children,
  fullWidth = true,
  className = '',
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`
        font-medium text-text-primary py-4 px-6 rounded-xl
        bg-white/80 border border-primary/20 shadow-sm
        transition-all duration-150 active:scale-[0.98]
        hover:shadow-md
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
