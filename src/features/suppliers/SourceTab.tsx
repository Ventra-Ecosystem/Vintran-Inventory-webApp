'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { OrdersView } from './components/OrdersView';
import { SuppliersView } from './components/SuppliersView';
import { ReceiveView } from './components/ReceiveView';
import { MessagesView } from './components/MessagesView';
import { BenefitsView } from './components/BenefitsView';

type SourceTab = 'Orders' | 'Suppliers' | 'Receive' | 'Messages' | 'Benefits';

const TABS: { value: SourceTab; label: string }[] = [
  { value: 'Orders', label: 'Orders' },
  { value: 'Suppliers', label: 'Suppliers' },
  { value: 'Receive', label: 'Receive' },
  { value: 'Messages', label: 'Messages' },
  { value: 'Benefits', label: 'Benefits' },
];

export function SourceTab() {
  const [activeTab, setActiveTab] = useState<SourceTab>('Suppliers');

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
      <div>
        {activeTab === 'Orders' && <OrdersView />}
        {activeTab === 'Suppliers' && <SuppliersView />}
        {activeTab === 'Receive' && <ReceiveView />}
        {activeTab === 'Messages' && <MessagesView />}
        {activeTab === 'Benefits' && <BenefitsView />}
      </div>
    </div>
  );
}
