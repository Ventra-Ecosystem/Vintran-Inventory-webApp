import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  iconBgClassName?: string;
  iconClassName?: string;
  className?: string;
  textSize?: string;
  textSize2?: string;
}

export function StatCard01({
  icon,
  value,
  label,
  iconBgClassName = 'bg-[#ECF9FF]',
  iconClassName = 'text-brand',
  className,
  textSize,
  textSize2,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-[16px] bg-bg-surface px-3 py-4 flex flex-col gap-2',
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          iconBgClassName,
          iconClassName
        )}
      >
        {icon}
      </div>

      <div className="flex flex-col text-left gap-1.5">
        <p className={cn('text-lg font-semibold text-text-default', textSize)}>
          {value}
        </p>

        <p className={cn('text-sm font-medium text-text-helper', textSize2)}>
          {label}
        </p>
      </div>
    </div>
  );
}
