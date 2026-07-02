'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { OrderDetail } from './OrderDetail';
import type { Order, HeaderOverride } from './types';

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
    supplierId: '2',
    supplierName: 'PetroBase NG',
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

interface OrdersTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function OrdersTab({ onHeaderChange, onClearOverride }: OrdersTabProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    onHeaderChange({
      title: `Order ${order.id}`,
      onBack: () => {
        setSelectedOrder(null);
        onClearOverride();
      },
    });
  };

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          onClearOverride();
        }}
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
        options={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'awaiting-receipt', label: 'Awaiting receipt' },
          { value: 'received', label: 'Received' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <div className="bg-bg-surface rounded-[8px]">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0 cursor-pointer"
            onClick={() => selectOrder(order)}
          >
            <div>
              <p className="text-xs font-semibold text-text-default">
                {order.id}
              </p>
              <p className="text-[10px] text-text-muted">{order.date}</p>
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
