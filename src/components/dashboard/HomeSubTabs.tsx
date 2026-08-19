'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';

const subTabs = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/overview', label: 'Business overview' },
];

export function HomeSubTabs() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center">
      <div className="px-2 w-fit py-1.5 my-6 bg-bg-surface rounded-[32px] flex items-center gap-3">
        {subTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'h-[34px] py-2 px-2.5 rounded-[32px]',
                active ? 'bg-brand' : 'bg-white'
              )}
            >
              <p
                className={cn(
                  'font-medium text-xs',
                  active ? 'text-white' : 'text-brand'
                )}
              >
                {tab.label}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
