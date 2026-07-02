// src/components/ui/Input.tsx
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-950"
        >
          {label}
        </label>

        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            // noValidate-friendly: we handle our own error display, not the browser's
            className={cn(
              'h-12 w-full rounded-xl border border-neutral-200 px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10',
              icon && 'pl-11',
              error && 'border-red-400 focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
