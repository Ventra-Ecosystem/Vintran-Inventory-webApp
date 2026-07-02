import { cn } from '@/src/lib/utils';

interface SummaryCardProps {
  value: string;
  label: string;
  valueClassName?: string;
  labelClassName?: string;
  className?: string;
}

export function StatCard02({
  value,
  label,
  valueClassName,
  labelClassName,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-1 rounded-[16px] bg-white px-3 py-4',
        className
      )}
    >
      <p
        className={cn(
          'text-lg font-semibold text-text-default',
          valueClassName
        )}
      >
        {value}
      </p>

      <p className={cn('text-sm font-medium text-text-helper', labelClassName)}>
        {label}
      </p>
    </div>
  );
}
