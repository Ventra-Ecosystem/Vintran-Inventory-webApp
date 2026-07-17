'use client';

import { useState } from 'react';
import { OverviewTab } from '@/src/features/warehouse/OverviewTab';
import { ReceiveTab } from '@/src/features/warehouse/ReceiveTab';
import { TransferTab } from '@/src/features/warehouse/TransferTab';
import { LocationsTab } from '@/src/features/warehouse/LocationsTab';
import { AdjustTab } from '@/src/features/warehouse/AdjustTab';
import { HistoryTab } from '@/src/features/warehouse/HistoryTab';
import { cn } from '@/src/lib/utils';

type WarehouseTab = 'overview' | 'receive' | 'transfer' | 'locations' | 'adjust' | 'history';

const TABS: { value: WarehouseTab; label: string }[] = [
  { value: 'overview',  label: 'Overview'  },
  { value: 'receive',   label: 'Receive'   },
  { value: 'transfer',  label: 'Transfer'  },
  { value: 'locations', label: 'Locations' },
  { value: 'adjust',    label: 'Adjust'    },
  { value: 'history',   label: 'History'   },
];

const TAB_TITLES: Record<WarehouseTab, string> = {
  overview:  'Warehouse',
  receive:   'Warehouse',
  transfer:  'Warehouse',
  locations: 'Warehouse',
  adjust:    'Warehouse',
  history:   'Warehouse',
};

export default function WarehouseManagementPage() {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('overview');

  return (
    <div className="flex flex-col h-full">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-text-default mb-4">
        {TAB_TITLES[activeTab]}
      </h1>

      {/* Tab bar */}
      <div className="flex items-end gap-6 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'pb-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
              activeTab === tab.value
                ? 'text-text-default border-brand'
                : 'text-text-helper border-transparent hover:text-text-subtle'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview'  && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'receive'   && <ReceiveTab />}
        {activeTab === 'transfer'  && <TransferTab />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'adjust'    && <AdjustTab />}
        {activeTab === 'history'   && <HistoryTab />}
      </div>
    </div>
  );
}
