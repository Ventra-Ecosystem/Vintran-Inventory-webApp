'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { Menu } from 'lucide-react';
import { BackArrowIcon, DashSquareIcon } from '@/src/assets/icon';

interface ProductHeaderProps {
  title: string;
  showBack: boolean;
  onBack?: () => void;
  onAddClick?: () => void;
}

export function ProductHeader({
  title,
  showBack,
  onBack,
  onAddClick,
}: ProductHeaderProps) {
  const toggleDrawer = useUIStore((state) => state.toggleDrawer);

  return (
    <div className="flex items-center justify-between pb-5">
      <div className="flex items-center gap-3 text-text-default">
        {showBack && (
          <button onClick={onBack} aria-label="Go back">
            <BackArrowIcon width={24} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-black">{title}</h1>
      </div>

      {!showBack && (
        <div className="flex items-center gap-3">
          <button
            onClick={onAddClick}
            aria-label="Add product"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={toggleDrawer}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-surface text-neutral-700 text-brand"
          >
            <DashSquareIcon />
          </button>
        </div>
      )}
    </div>
  );
}
