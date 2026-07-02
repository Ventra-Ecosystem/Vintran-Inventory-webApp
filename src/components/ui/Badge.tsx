import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/src/lib/utils';

interface BadgeProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  textClassName?: string;
  style?: CSSProperties;
  textStyle?: CSSProperties;
}

export function Badge({
  children,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex w-fit items-center gap-[2px] rounded-full px-2',
        className
      )}
      style={{
        backgroundColor: '#99BBFF', // Replace with your desired default
        ...style,
      }}
    >
      {leftIcon}

      <span
        className={cn('text-xs font-medium', textClassName)}
        style={{
          color: '#0055FF', // Replace with your desired default
          ...textStyle,
        }}
      >
        {children}
      </span>

      {rightIcon}
    </div>
  );
}
