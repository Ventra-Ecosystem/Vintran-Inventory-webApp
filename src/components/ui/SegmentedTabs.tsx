'use client';

import { cn } from '@/src/lib/utils';

interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[32px] bg-bg-surface px-2 py-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 whitespace-nowrap rounded-[32px] py-2 text-xs font-medium transition-colors',
            value === opt.value
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-text-helper'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
