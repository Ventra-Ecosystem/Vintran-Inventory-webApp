'use client';

import { useEffect, useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { OrderDetail } from './OrderDetail';
import { purchaseOrdersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import type { Supplier, Order } from './types';

type OrderFilter = 'all' | 'pending' | 'awaiting-receipt' | 'received';

const STATUS_MAP: Record<string, Order['status']> = {
  Pending: 'pending',
  PartiallyReceived: 'awaiting-receipt',
  FullyReceived: 'received',
  Cancelled: 'pending',
};

const orderFilters: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting-receipt', label: 'Awaiting receipt' },
  { value: 'received', label: 'Received' },
];

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function SupplierOrders({ supplier }: { supplier: Supplier }) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    purchaseOrdersApi.list()
      .then((res: any) => {
        const all: any[] = toArr(res.data);
        // Filter by this supplier
        const forSupplier = all.filter((o: any) => o.supplierId === supplier.id);
        setOrders(forSupplier.map((o: any) => ({
          id: o.number ?? o.id,
          supplierId: o.supplierId,
          supplierName: o.supplierName ?? supplier.name,
          items: (o.lines ?? []).map((l: any) => ({
            productId: l.productId,
            name: l.productName,
            quantity: l.quantity,
            price: `₦${(l.unitCost ?? 0).toLocaleString()}`,
          })),
          status: STATUS_MAP[o.status] ?? 'pending',
          date: o.createdOnUtc?.split('T')[0] ?? '',
          total: `₦${(o.totalPayable ?? 0).toLocaleString()}`,
        })));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load orders');
        }
      })
      .finally(() => setLoading(false));
  }, [supplier.id]);

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs options={orderFilters} value={filter} onChange={setFilter} />
      {loading ? (
        <div className="text-center py-8 text-text-muted text-sm">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">No orders found</div>
      ) : (
        <div className="bg-bg-surface rounded-[8px]">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div>
                <p className="text-xs font-semibold text-text-default">{order.id}</p>
                <p className="text-[10px] text-text-muted">{order.date} · {order.items.length} items</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-text-default">{order.total}</p>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full',
                  order.status === 'received' ? 'bg-green-50 text-green-600'
                  : order.status === 'pending' ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
                )}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
