'use client';

import { useEffect, useState } from 'react';
import { DashSquareIcon, NotificationIcon } from '@/src/assets/icon';
import { useUIStore } from '@/src/store/uiStore';
import { useAuthStore } from '@/src/store/authStore';
import { useMe } from '@/src/hooks/useMe';
import { notificationsApi } from '@/src/lib/api/commerce';

export default function DashboardHeader() {
  const toggleDrawer = useUIStore((s) => s.toggleDrawer);
  useMe();
  const { businessName, isOwner } = useAuthStore();
  const displayRole = isOwner ? 'Business Owner' : 'Staff';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsApi.getUnreadCount()
      .then((res: any) => setUnread(res.data ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col">
        <h1 className="font-semibold text-black text-xl">{businessName ?? 'My Business'}</h1>
        <p className="text-text-subtle font-medium text-xs">{displayRole}</p>
      </div>
      <div className="flex gap-3">
        <div className="bg-bg-surface rounded-full justify-center items-center flex w-10 h-10 relative">
          <NotificationIcon />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
        <div
          onClick={toggleDrawer}
          className="bg-bg-surface rounded-full w-10 h-10 flex items-center justify-center text-brand cursor-pointer"
        >
          <DashSquareIcon />
        </div>
      </div>
    </div>
  );
}
