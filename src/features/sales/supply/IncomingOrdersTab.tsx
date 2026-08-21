'use client';

import { useEffect, useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import type { HeaderOverride } from '../types';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

type OrderFilter = 'all' | 'pending' | 'processing' | 'delivered';

interface IncomingOrdersTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function IncomingOrdersTab({ onHeaderChange, onClearOverride }: IncomingOrdersTabProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    b2bApi.getIncomingOrders()
      .then((res: any) => {
        setOrders(toArr(res.data));
      })
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.description : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o: any) => o.status?.toLowerCase() === filter);

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

      {loading ? (
        <div className="text-text-muted text-sm py-8 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-text-muted text-sm py-8 text-center">No orders found</div>
      ) : (
        <div className="bg-bg-surface rounded-[8px]">
          {filtered.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0">
              <div>
                <p className="text-xs font-semibold text-text-default">{order.number ?? order.id}</p>
                <p className="text-[10px] text-text-muted">
                  {order.buyerBusinessName ?? ''}{order.createdOnUtc ? ` · ${new Date(order.createdOnUtc).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-text-default">
                  {order.currency ?? ''} {(order.totalValue ?? 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-text-muted capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
