'use client';

import { DashSquareIcon, NotificationIcon } from '@/src/assets/icon';
import { useUIStore } from '@/src/store/uiStore';

export default function DashboardHeader() {
  const toggleDrawer = useUIStore((s) => s.toggleDrawer);

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col">
        <h1 className="font-semibold text-black text-xl">JT Business</h1>
        <p className="text-text-subtle font-medium text-xs">Admin</p>
      </div>
      <div className="flex gap-3">
        <div className="bg-bg-surface rounded-full justify-center items-center flex w-10 h-10">
          <NotificationIcon />
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
