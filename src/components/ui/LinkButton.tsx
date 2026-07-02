import Link from 'next/link';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button';
import { cn } from '@/src/lib/utils';

interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
  href: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function LinkButton({
  href,
  children,
  variant,
  size,
  fullWidth,
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </Link>
  );
}
