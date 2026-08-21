'use client';

import { useEffect, useState } from 'react';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { Search } from 'lucide-react';

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  Processing: { label: 'Processing', bg: 'bg-blue-100', color: 'text-brand' },
  Delivered: { label: 'Delivered', bg: 'bg-green-100', color: 'text-green-600' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-100', color: 'text-red-600' },
};

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export function SupplyOrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Processing' | 'Delivered' | 'Cancelled'>('all');

  useEffect(() => {
    b2bApi.getIncomingOrders()
      .then((res: any) => setOrders(toArr(res.data)))
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && (err.status === 403 || err.status === 402))) {
          toast.error('Failed to load orders');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: 'Processing' | 'Delivered' | 'Cancelled') => {
    try {
      await b2bApi.updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status } : o)
      );
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update status');
    }
  };

  const filtered = orders.filter((o: any) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !(o.number ?? o.id ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…"
          className="w-full h-11 pl-9 pr-4 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand focus:outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'Processing', 'Delivered', 'Cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No orders found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const style = STATUS_STYLE[order.status] ?? { label: order.status, bg: 'bg-gray-100', color: 'text-gray-500' };
            return (
              <div key={order.id} className="bg-bg-surface rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-default">{order.number ?? order.id}</p>
                    <p className="text-xs text-text-muted">{order.buyerBusinessName ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-default">{fmt(order.total)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${style.bg} ${style.color}`}>{style.label}</span>
                  </div>
                </div>
                {order.status === 'Processing' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, 'Delivered')}
                      className="flex-1 h-8 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100"
                    >
                      Mark Delivered
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, 'Cancelled')}
                      className="flex-1 h-8 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
