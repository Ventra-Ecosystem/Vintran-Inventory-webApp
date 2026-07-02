'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { ReceiptDetail } from '@/src/components/dashboard/ReceiptDetail';
import { PakageIcon, WareHouseIcon } from '@/src/assets/icon';

type HistoryFilter = 'all' | 'received' | 'transferred' | 'adjustments';

// TODO: replace with real API call
const historyItems = [
  {
    id: '1',
    type: 'received' as const,
    product: 'Rice (50kg bag)',
    quantity: '20',
    date: '2026-06-20',
    location: 'Main Warehouse',
  },
  {
    id: '2',
    type: 'transferred' as const,
    product: 'Cooking oil (5L)',
    quantity: '15',
    date: '2026-06-22',
    location: 'Secondary Depot',
  },
  {
    id: '3',
    type: 'adjustments' as const,
    product: 'Sugar (1kg)',
    quantity: '8',
    date: '2026-06-25',
    location: 'Main Warehouse',
  },
];

export function HistoryTab() {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [selectedItem, setSelectedItem] = useState<
    (typeof historyItems)[number] | null
  >(null);

  if (selectedItem) {
    return (
      <ReceiptDetail
        title={`${selectedItem.product} receipt`}
        type={selectedItem.type}
        details={[
          { label: 'Product', value: selectedItem.product },
          { label: 'Quantity', value: selectedItem.quantity },
          { label: 'Date', value: selectedItem.date },
          { label: 'Location', value: selectedItem.location },
          { label: 'Type', value: selectedItem.type },
        ]}
      />
    );
  }

  const filteredItems =
    filter === 'all'
      ? historyItems
      : historyItems.filter((item) => item.type === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs
        options={[
          { value: 'all', label: 'All' },
          { value: 'received', label: 'Received' },
          { value: 'transferred', label: 'Transferred' },
          { value: 'adjustments', label: 'Adjustments' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b border-[#9B9EA34D] py-2"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex gap-2 items-center">
              <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                <WareHouseIcon />
              </div>
              <div className="gap-1 flex flex-col">
                <p className="text-text-default font-semibold text-xs">
                  {item.product}
                </p>
                <p className="text-text-muted font-medium text-[10px]">
                  {item.location}
                </p>

                <p className="text-text-muted font-medium text-[10px]">
                  {item.type}
                </p>
              </div>
            </div>
            <div className="flex justify-between flex-col gap-3 items-end">
              <p className="text-[#007FAB] text-xs font-semibold">
                {item.quantity} units
              </p>
              <p className="font-medium text-text-default text-xs">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
