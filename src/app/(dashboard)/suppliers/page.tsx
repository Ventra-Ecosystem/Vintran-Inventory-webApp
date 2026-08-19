'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { SourceTab } from '@/src/features/suppliers/SourceTab';
import { SupplyTab } from '@/src/features/suppliers/SupplyTab';
import { DashSquareIcon } from '@/src/assets/icon';
import { ShoppingCart, Store } from 'lucide-react';

type Segment = 'Source' | 'Supply';

export default function SuppliersPage() {
  const [activeSegment, setActiveSegment] = useState<Segment>('Source');

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-default">Supplies Management</h1>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-primary-alpha-10 flex items-center justify-center text-brand"
        >
          <DashSquareIcon width={20} className="text-brand" />
        </button>
      </div>

      {/* Top Segment Mode Toggles */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSegment('Source')}
          className={cn(
            "flex-1 flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors text-left",
            activeSegment === 'Source'
              ? "border-brand bg-[#F0F7FF]"
              : "border-gray-100 bg-gray-50 hover:bg-gray-100"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            activeSegment === 'Source' ? "bg-primary-alpha-20" : "bg-gray-200"
          )}>
            <ShoppingCart size={20} className={activeSegment === 'Source' ? "text-brand" : "text-gray-500"} />
          </div>
          <div>
            <p className={cn("text-sm font-bold", activeSegment === 'Source' ? "text-brand" : "text-gray-500")}>Source</p>
            <p className="text-xs text-gray-500">Buy from suppliers</p>
          </div>
        </button>

        <button
          onClick={() => setActiveSegment('Supply')}
          className={cn(
            "flex-1 flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors text-left",
            activeSegment === 'Supply'
              ? "border-brand bg-[#F0F7FF]"
              : "border-gray-100 bg-gray-50 hover:bg-gray-100"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            activeSegment === 'Supply' ? "bg-primary-alpha-20" : "bg-gray-200"
          )}>
            <Store size={20} className={activeSegment === 'Supply' ? "text-brand" : "text-gray-500"} />
          </div>
          <div>
            <p className={cn("text-sm font-bold", activeSegment === 'Supply' ? "text-gray-900" : "text-gray-500")}>Supply</p>
            <p className="text-xs text-gray-500">Sell to businesses</p>
          </div>
        </button>
      </div>

      {activeSegment === 'Source' ? <SourceTab /> : <SupplyTab />}
    </div>
  );
}
