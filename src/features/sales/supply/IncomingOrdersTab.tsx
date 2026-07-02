'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import type { HeaderOverride } from '../types';

type OrderFilter = 'all' | 'pending' | 'processing' | 'delivered';

const incomingOrders = [
  {
    id: 'ORD-2201',
    buyer: 'Kola Foods NG',
    total: '₦325,000',
    status: 'pending' as const,
    date: '2026-06-28',
  },
  {
    id: 'ORD-2198',
    buyer: 'Sunrise Traders',
    total: '₦85,000',
    status: 'delivered' as const,
    date: '2026-06-25',
  },
];

interface IncomingOrdersTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function IncomingOrdersTab({
  onHeaderChange,
  onClearOverride,
}: IncomingOrdersTabProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');

  const filtered =
    filter === 'all'
      ? incomingOrders
      : incomingOrders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs
        options={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'delivered', label: 'Delivered' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <div className="bg-bg-surface rounded-[8px]">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0"
          >
            <div>
              <p className="text-xs font-semibold text-text-default">
                {order.id}
              </p>
              <p className="text-[10px] text-text-muted">
                {order.buyer} · {order.date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-text-default">
                {order.total}
              </p>
              <p className="text-[10px] text-text-muted">{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
