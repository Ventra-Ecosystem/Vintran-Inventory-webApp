'use client';

import { useEffect, useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { OrderDetail } from './OrderDetail';
import type { Order, HeaderOverride } from './types';
import { purchaseOrdersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

type OrderFilter = 'all' | 'pending' | 'awaiting-receipt' | 'received';

const STATUS_MAP: Record<string, Order['status']> = {
  Open: 'pending',
  PartiallyReceived: 'awaiting-receipt',
  FullyReceived: 'received',
  Cancelled: 'pending',
  CancellationPending: 'pending',
};

interface OrdersTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function OrdersTab({ onHeaderChange, onClearOverride }: OrdersTabProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseOrdersApi.list()
      .then((res: any) => {
        const items: any[] = res.data ?? [];
        setOrders(items.map((o: any) => ({
          id: o.number ?? o.id,
          supplierId: o.supplierId,
          supplierName: o.supplierName ?? '',
          items: (o.lines ?? []).map((l: any) => ({
            productId: l.productId,
            name: l.productName,
            quantity: l.quantity,
            price: `₦${l.unitCost?.toLocaleString() ?? 0}`,
          })),
          status: STATUS_MAP[o.status] ?? 'pending',
          date: o.createdOnUtc?.split('T')[0] ?? '',
          total: `₦${o.totalPayable?.toLocaleString() ?? 0}`,
        })));
      })
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.description : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    onHeaderChange({ title: `Order ${order.id}`, onBack: () => { setSelectedOrder(null); onClearOverride(); } });
  };

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => { setSelectedOrder(null); onClearOverride(); }} />;
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

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
      {loading ? (
        <div className="text-center py-8 text-text-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">No orders found</div>
      ) : (
        <div className="bg-bg-surface rounded-[8px]">
          {filtered.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0 cursor-pointer" onClick={() => selectOrder(order)}>
              <div>
                <p className="text-xs font-semibold text-text-default">{order.id}</p>
                <p className="text-[10px] text-text-muted">{order.supplierName} · {order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-text-default">{order.total}</p>
                <p className="text-[10px] text-text-muted capitalize">{order.status.replace('-', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
