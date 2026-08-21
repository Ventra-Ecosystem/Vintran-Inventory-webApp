'use client';

import { useEffect, useState } from 'react';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { PakageIcon, StoreIcon } from '@/src/assets/icon';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export function DashboardView() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    b2bApi.getSupplyDashboard()
      .then((res: any) => setDashboard(res.data ?? null))
      .catch((err: unknown) => {
        // 403 / plan-restricted — silently show empty state
        if (!(err instanceof ApiError && (err.status === 403 || err.status === 402))) {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-text-muted text-sm">Loading…</div>;
  }

  if (!dashboard) {
    return (
      <div className="text-center py-10 space-y-2">
        <StoreIcon width={36} className="mx-auto text-gray-300" />
        <p className="text-sm text-gray-500">No supply dashboard data yet</p>
        <p className="text-xs text-gray-400">Create B2B listings to start supplying to businesses</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-brand-lighter flex items-center justify-center mb-2">
            <PakageIcon width={18} className="text-brand" />
          </div>
          <p className="text-xl font-bold text-[#0A0D14]">{dashboard.totalListings ?? 0}</p>
          <p className="text-xs text-text-muted">Total Listings</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-brand-lighter flex items-center justify-center mb-2">
            <PakageIcon width={18} className="text-brand" />
          </div>
          <p className="text-xl font-bold text-[#0A0D14]">{dashboard.activeOrders ?? 0}</p>
          <p className="text-xs text-text-muted">Active Orders</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <p className="text-xl font-bold text-[#0A0D14]">{fmt(dashboard.totalRevenue)}</p>
          <p className="text-xs text-text-muted">Total Revenue</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <p className="text-xl font-bold text-[#0A0D14]">{dashboard.pendingOrders ?? 0}</p>
          <p className="text-xs text-text-muted">Pending Orders</p>
        </div>
      </div>

      {(dashboard.recentOrders ?? []).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-text-default mb-3">Recent Orders</p>
          <div className="bg-bg-surface rounded-xl overflow-hidden">
            {dashboard.recentOrders.map((order: any, idx: number) => (
              <div key={order.id ?? idx} className={`px-4 py-3 flex items-center justify-between ${idx < dashboard.recentOrders.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-text-default">{order.number ?? order.id}</p>
                  <p className="text-xs text-text-muted">{order.buyerBusinessName ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-default">{fmt(order.total)}</p>
                  <p className="text-[10px] text-text-muted">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
