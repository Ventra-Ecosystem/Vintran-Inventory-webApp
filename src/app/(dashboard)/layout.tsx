'use client';

import { usePathname } from 'next/navigation';
import { useUIStore } from '@/src/store/uiStore';
import { BottomTabBar } from '@/src/components/dashboard/BottomTabBar';
import { SideDrawer } from '@/src/components/dashboard/SideDrawer';
import DashboardHeader from '@/src/components/dashboard/DashboardHeader';
import { cn } from '@/src/lib/utils';

const DASHBOARD_ROUTES = [
  '/home/dashboard',
  '/home/overview',
  '/product',
  '/sales',
  '/customer',
];

const ALWAYS_HIDE_TAB_BAR_PREFIXES = ['/warehouse-management'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTabBarVisible = useUIStore((s) => s.isTabBarVisible);

  const isHome = ['/home/dashboard', '/home/overview'].includes(pathname);
  const isDashboard = DASHBOARD_ROUTES.includes(pathname);

  const alwaysHidden = ALWAYS_HIDE_TAB_BAR_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  const showTabBar = isDashboard && !alwaysHidden && isTabBarVisible;

  return (
    <div
      className={cn(
        'w-screen h-screen px-padding pt-6 pb-6 flex flex-col flex-1 overflow-x-hidden',
        showTabBar && 'pb-20'
      )}
    >
      {isHome && <DashboardHeader />}

      {children}

      {showTabBar && <BottomTabBar />}

      <SideDrawer />
    </div>
  );
}
