'use client';

import { useState } from 'react';
import { WarehouseHeader } from '@/src/components/dashboard/WarehouseHeader';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { OverviewTab } from '@/src/features/warehouse/OverviewTab';
import { ReceiveTab } from '@/src/features/warehouse/ReceiveTab';
import { TransferTab } from '@/src/features/warehouse/TransferTab';
import { LocationsTab } from '@/src/features/warehouse/LocationsTab';
import { AdjustTab } from '@/src/features/warehouse/AdjustTab';
import { HistoryTab } from '@/src/features/warehouse/HistoryTab';
import { cn } from '@/src/lib/utils';

type WarehouseTab =
  | 'overview'
  | 'receive'
  | 'transfer'
  | 'locations'
  | 'adjust'
  | 'history';

const tabOptions: { value: WarehouseTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'receive', label: 'Receive' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'locations', label: 'Locations' },
  { value: 'adjust', label: 'Adjust' },
  { value: 'history', label: 'History' },
];

const tabTitles: Record<WarehouseTab, string> = {
  overview: 'Warehouse',
  receive: 'Receive stock',
  transfer: 'Transfer stock',
  locations: 'Locations',
  adjust: 'Adjust stock',
  history: 'History',
};

export default function WarehouseManagementPage() {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('overview');

  return (
    <main className="">
      <WarehouseHeader title={tabTitles[activeTab]} />

      <div className="">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tabOptions.map((opt) => (
            <div key={opt.value} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab(opt.value)}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-lg text-sm font-medium transition-colors',
                  activeTab === opt.value
                    ? 'text-text-default'
                    : 'text-text-helper'
                )}
              >
                {opt.label}
              </button>

              <div
                className={cn(
                  'h-[2px] w-8 transition-colors mt-0.5',
                  activeTab === opt.value ? 'bg-brand' : 'bg-transparent'
                )}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-5">
        {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'receive' && <ReceiveTab />}
        {activeTab === 'transfer' && <TransferTab />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'adjust' && <AdjustTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </main>
  );
}
