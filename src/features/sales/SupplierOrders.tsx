'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { OrderDetail } from './OrderDetail';
import type { Supplier, Order } from './types';

// TODO: replace with real API call
const mockOrders: Order[] = [
  {
    id: 'ORD-1042',
    supplierId: '1',
    supplierName: 'Agro Supplies Ltd',
    items: [
      {
        productId: 'p1',
        name: 'Rice (50kg bag)',
        quantity: 5,
        price: '₦65,000',
      },
    ],
    status: 'pending',
    date: '2026-06-20',
    total: '₦325,000',
  },
  {
    id: 'ORD-1038',
    supplierId: '1',
    supplierName: 'Agro Supplies Ltd',
    items: [
      {
        productId: 'p2',
        name: 'Cooking oil (5L)',
        quantity: 10,
        price: '₦8,500',
      },
    ],
    status: 'received',
    date: '2026-06-15',
    total: '₦85,000',
  },
];

type OrderFilter = 'all' | 'pending' | 'awaiting-receipt' | 'received';

const orderFilters: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting-receipt', label: 'Awaiting receipt' },
  { value: 'received', label: 'Received' },
];

export function SupplierOrders({ supplier }: { supplier: Supplier }) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  const filtered =
    filter === 'all'
      ? mockOrders
      : mockOrders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs
        options={orderFilters}
        value={filter}
        onChange={setFilter}
      />
      <div className="bg-bg-surface rounded-[8px]">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0"
            onClick={() => setSelectedOrder(order)}
          >
            <div>
              <p className="text-xs font-semibold text-text-default">
                {order.id}
              </p>
              <p className="text-[10px] text-text-muted">
                {order.date} · {order.items.length} items
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-text-default">
                {order.total}
              </p>
              <span
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                  order.status === 'received'
                    ? 'bg-green-50 text-green-600'
                    : order.status === 'pending'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600'
                )}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
