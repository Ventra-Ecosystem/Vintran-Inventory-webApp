import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface TransactionItemProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  amount: string;
  iconBgClassName?: string;
  className?: string;
  showDivider?: boolean;
}

export function TransactionItem({
  icon,
  title,
  subtitle,
  amount,
  iconBgClassName = 'bg-brand-lighter',
  className,
  showDivider = true,
}: TransactionItemProps) {
  return (
    <>
      <div className={cn('flex items-center justify-between pt-3', className)}>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              iconBgClassName
            )}
          >
            {icon}
          </div>

          <div className="flex flex-col justify-evenly">
            <p className="text-xs font-semibold text-text-default">{title}</p>

            <p className="text-[10px] font-medium text-text-muted">
              {subtitle}
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-text-default">{amount}</p>
      </div>

      {showDivider && <div className="mt-3 h-px bg-[#9B9EA34D]" />}
    </>
  );
}
