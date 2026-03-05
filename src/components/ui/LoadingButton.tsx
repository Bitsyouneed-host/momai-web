import PrimaryButton from './PrimaryButton';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading: boolean;
  loadingText?: string;
}

export default function LoadingButton({ children, isLoading, loadingText, ...props }: LoadingButtonProps) {
  return (
    <PrimaryButton isLoading={isLoading} {...props}>
      {isLoading ? (loadingText || 'Loading...') : children}
    </PrimaryButton>
  );
}
