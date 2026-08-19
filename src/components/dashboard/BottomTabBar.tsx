'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Menu,
  TrendingUp,
  Users,
  PackageIcon,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useUIStore } from '@/src/store/uiStore';
import {
  HomeIcon,
  PakageIcon,
  MoneyIcon,
  UserIcon,
  DashSquareIcon,
} from '@/src/assets/icon';

const tabs = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    matchPrefix: '/dashboard',
  },
  {
    href: '/product',
    label: 'Product',
    icon: PakageIcon,
    matchPrefix: '/product',
  },
  { href: '/sales', label: 'Sales', icon: MoneyIcon, matchPrefix: '/sales' },
  {
    href: '/customer',
    label: 'Customer',
    icon: UserIcon,
    matchPrefix: '/customer',
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const toggleDrawer = useUIStore((state) => state.toggleDrawer);

  // Split tabs so the menu icon sits in the middle (2 tabs, icon, 2 tabs)
  const [leftTabs, rightTabs] = [tabs.slice(0, 2), tabs.slice(2)];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-[1px] border-[#F5F5F5] border-neutral-100 bg-[#FFFFFF1A] backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 mx-padding rounded-[8px]">
      <div className="flex max-w-md justify-between items-center">
        {leftTabs.map((tab) => (
          <TabLink
            key={tab.href}
            tab={tab}
            active={pathname.startsWith(tab.matchPrefix)}
          />
        ))}

        <div className="flex flex-1 justify-center">
          <button
            onClick={toggleDrawer}
            aria-label="Open menu"
            style={{ width: 40, height: 40 }}
            className="flex items-center justify-center rounded-full bg-brand text-white"
          >
            <DashSquareIcon />
          </button>
        </div>

        {rightTabs.map((tab) => (
          <TabLink
            key={tab.href}
            tab={tab}
            active={pathname.startsWith(tab.matchPrefix)}
          />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  tab,
  active,
}: {
  tab: (typeof tabs)[number];
  active: boolean;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className="flex flex-1 flex-col items-center gap-1 py-1 text-xs"
    >
      <Icon width={22} className={active ? 'text-brand' : 'text-neutral-400'} />
      <span
        className={cn(active ? 'font-medium text-brand' : 'text-neutral-400')}
      >
        {tab.label}
      </span>
    </Link>
  );
}
