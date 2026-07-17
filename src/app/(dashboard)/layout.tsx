'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/src/components/dashboard/Sidebar';
import { NotificationIcon } from '@/src/assets/icon';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname.startsWith('/home');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden border-l border-gray-100">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          {isHome ? (
            <div>
              <h1 className="text-xl font-bold text-text-default">JT Business</h1>
              <p className="text-xs font-medium text-text-subtle">Admin</p>
            </div>
          ) : (
            <div /> /* empty — page-level h1 handles the title */
          )}
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-surface text-text-muted">
            <NotificationIcon width={20} />
          </button>
        </div>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
