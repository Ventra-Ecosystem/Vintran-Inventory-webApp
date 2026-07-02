'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BackArrowIcon, DashSquareIcon, HomeIcon } from '@/src/assets/icon';

interface WarehouseHeaderProps {
  title: string;
}

export function WarehouseHeader({ title }: WarehouseHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Go back">
          <BackArrowIcon width={20} className="text-[#54575C]" />
        </button>
        <h1 className="text-xl font-semibold text-black">{title}</h1>
      </div>
      <div className="bg-bg-surface h-10 w-10 justify-center items-center flex rounded-full text-brand">
        <DashSquareIcon />
      </div>
    </div>
  );
}
