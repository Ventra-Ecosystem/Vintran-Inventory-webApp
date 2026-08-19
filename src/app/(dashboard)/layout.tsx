'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sidebar } from '@/src/components/dashboard/Sidebar';
import { NotificationIcon } from '@/src/assets/icon';
import { Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname.startsWith('/home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { businessName } = useAuthStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 bg-white",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-[84px] lg:min-w-[84px]" : "lg:w-[270px] lg:min-w-[270px]"
      )}>
        <Sidebar
          isCollapsed={isCollapsed}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden border-l border-gray-100">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden p-1.5 -ml-2 rounded-md text-text-muted hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
            >
              <Menu width={20} />
            </button>

            {/* Desktop menu toggle (optional, just another way to toggle besides the sidebar button itself) */}
            <button
              type="button"
              className="hidden lg:block p-1.5 -ml-2 rounded-md text-text-muted hover:bg-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu width={20} />
            </button>

            {isHome ? (
              <div>
                <h1 className="text-xl font-bold text-text-default">{businessName ?? 'My Business'}</h1>
                <p className="text-xs font-medium text-text-subtle">Admin</p>
              </div>
            ) : (
              <div /> /* empty — page-level h1 handles the title */
            )}
          </div>

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
