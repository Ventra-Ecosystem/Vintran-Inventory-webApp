'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { PakageIcon } from '@/src/assets/icon';
import { Eye } from 'lucide-react';

type AlertFilter = 'all' | 'low-stock' | 'out-of-stock';

// TODO: replace with real API call
const alerts = [
  {
    id: '1',
    name: 'Sugar (1kg)',
    percentRemaining: 12,
    type: 'low-stock' as const,
  },
  {
    id: '2',
    name: 'Salt (500g)',
    percentRemaining: 0,
    type: 'out-of-stock' as const,
  },
  {
    id: '3',
    name: 'Cooking oil (5L)',
    percentRemaining: 8,
    type: 'low-stock' as const,
  },
];

interface AlertsTabProps {
  onViewProduct: (productId: string) => void;
}

export function AlertsTab({ onViewProduct }: AlertsTabProps) {
  const [filter, setFilter] = useState<AlertFilter>('low-stock');

  const filtered = alerts.filter((a) => a.type === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs
        options={[
          { value: 'low-stock', label: 'Low stock' },
          { value: 'out-of-stock', label: 'Out of stock' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {filtered.map((item) => (
        <div
          key={item.id}
          className="rounded-[12px] px-3 py-2.5 bg-bg-surface flex flex-col gap-4"
        >
          <div className="flex gap-2 items-center">
            <PakageIcon width={24} />
            <div>
              <p className="text-text-subtle font-semibold text-sm">
                {item.name}
              </p>
              <p className="text-text-subtle text-xs font-medium">
                Store A · VI · SKU-0119
              </p>
            </div>
          </div>
          <div className="flex items-center ">
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F3F4F5]">
              <div
                className="h-full rounded-full bg-[#BB5902]"
                style={{ width: `${60}%` }}
              />
            </div>

            <div className="text-[#6D7075] text-xs font-medium whitespace-nowrap">
              6/10 units
            </div>
          </div>
          <div>
            <button
              onClick={() => onViewProduct(item.id)}
              className="text-[#BB5902] text-xs font-medium bg-amber-lighter w-full py-1 flex rounded-[8px] justify-center items-center"
            >
              <Eye size={20} /> <p>View</p>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
