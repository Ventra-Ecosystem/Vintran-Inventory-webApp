'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { DashboardView } from './components/DashboardView';
import { MyListingsView } from './components/MyListingsView';
import { SupplyOrdersView } from './components/SupplyOrdersView';
import { DeliveryView } from './components/DeliveryView';
import { SupplyMessagesView } from './components/SupplyMessagesView';

type SupplyTab = 'Dashboard' | 'MyListings' | 'Orders' | 'Delivery' | 'Messages';

const TABS: { value: SupplyTab; label: string }[] = [
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'MyListings', label: 'My Listings' },
  { value: 'Orders', label: 'Orders' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Messages', label: 'Messages' },
];

export function SupplyTab() {
  const [activeTab, setActiveTab] = useState<SupplyTab>('Dashboard');

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex items-end gap-6 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'pb-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px relative',
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
      <div>
        {activeTab === 'Dashboard' && <DashboardView />}
        {activeTab === 'MyListings' && <MyListingsView />}
        {activeTab === 'Orders' && <SupplyOrdersView />}
        {activeTab === 'Delivery' && <DeliveryView />}
        {activeTab === 'Messages' && <SupplyMessagesView />}
      </div>
    </div>
  );
}
