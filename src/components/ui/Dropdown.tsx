'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ArrowdownIcon } from '@/src/assets/icon';

export interface DropdownOption<T = string> {
  label: string;
  value: T;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  triggerClassName?: string;
  optionClassName?: string;
  placeholderClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Dropdown<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  menuClassName,
  triggerClassName,
  optionClassName,
  placeholderClassName,
  icon,
  disabled,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-[8px] border border-[#E2E4E9] bg-white p-3 text-left',
          disabled && 'cursor-not-allowed opacity-60',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'text-sm font-normal',
            selected ? 'text-text-default' : 'text-[#9B9EA3]',
            placeholderClassName
          )}
        >
          {selected?.label ?? placeholder}
        </span>

        {icon ?? (
          <ArrowdownIcon
            className={cn('h-5 w-5 transition-transform', open && 'rotate-180')}
          />
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg',
            menuClassName
          )}
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full px-4 py-3 text-left text-sm hover:bg-bg-surface',
                value === option.value &&
                  'bg-bg-surface font-medium text-brand',
                optionClassName
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
