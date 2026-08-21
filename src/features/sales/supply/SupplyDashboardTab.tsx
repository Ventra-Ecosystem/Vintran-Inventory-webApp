'use client';

import { useEffect, useState } from 'react';
import { PakageIcon } from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export function SupplyDashboardTab() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      b2bApi.getSupplyDashboard(),
      b2bApi.getIncomingOrders(),
    ]).then(([dashRes, ordersRes]: any) => {
      setDashboard(dashRes.data ?? null);
      const d = ordersRes.data;
      setOrders(Array.isArray(d) ? d.slice(0, 5) : toArr(d).slice(0, 5));
    }).catch((err: unknown) => {
      toast.error(err instanceof ApiError ? err.description : 'Failed to load supply dashboard');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-text-muted text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard01 icon={<PakageIcon width={24} />} value={String(dashboard?.totalOrders ?? 0)} label="Total orders" />
        <StatCard01 icon={<PakageIcon width={24} />} value={String(dashboard?.listedItems ?? 0)} label="Listed items" />
        <StatCard01 icon={<PakageIcon width={24} />} value={fmt(dashboard?.revenue)} label="Revenue" />
        <StatCard01 icon={<PakageIcon width={24} />} value={dashboard?.averageRating?.toFixed(1) ?? '—'} label="Avg rating" />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">Recent orders</p>
        {orders.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">No orders yet</p>
        ) : (
          <div className="bg-bg-surface rounded-[8px]">
            {orders.map((o: any) => (
              <div key={o.id} className="flex justify-between px-4 py-3 border-b border-[#9B9EA34D] last:border-0">
                <div>
                  <p className="text-xs font-medium text-text-default">{o.number ?? o.id}</p>
                  <p className="text-[10px] text-text-muted">{o.buyerBusinessName ?? ''}</p>
                </div>
                <p className="text-xs text-text-muted capitalize">{o.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
