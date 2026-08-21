'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PakageIcon, StoreIcon, HomeIcon } from '@/src/assets/icon';
import { purchaseOrdersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

const PO_STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  Pending: { label: 'Pending', bg: 'bg-amber-100', color: 'text-amber-600' },
  PartiallyReceived: { label: 'Partially Received', bg: 'bg-blue-100', color: 'text-brand' },
  FullyReceived: { label: 'Fully Received', bg: 'bg-green-100', color: 'text-green-600' },
  CancellationPending: { label: 'Cancellation Pending', bg: 'bg-amber-100', color: 'text-amber-600' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-100', color: 'text-red-600' },
};

export function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Recent' | 'Pending' | 'Received'>('Recent');

  useEffect(() => {
    setLoading(true);
    purchaseOrdersApi.list()
      .then((res: any) => {
        setOrders(toArr(res.data));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load orders');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o: any) => {
    if (filter === 'Pending' && o.status !== 'Pending') return false;
    if (filter === 'Received' && o.status !== 'FullyReceived') return false;
    if (search && !(o.number ?? o.id ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = orders.length;
  const received = orders.filter((o: any) => o.status === 'FullyReceived').length;
  const pending = orders.filter((o: any) => o.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary-alpha-10 flex items-center justify-center mb-2">
            <PakageIcon width={16} className="text-brand" />
          </div>
          <p className="text-xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary-alpha-10 flex items-center justify-center mb-2">
            <HomeIcon width={16} className="text-brand" />
          </div>
          <p className="text-xl font-bold text-gray-900">{received}</p>
          <p className="text-xs text-gray-500 mt-1">Received</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
            <StoreIcon width={16} className="text-amber-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{pending}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['Recent', 'Pending', 'Received'] as const).map((pill) => (
          <button
            key={pill}
            onClick={() => setFilter(pill)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === pill ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders"
          className="w-full h-11 pl-9 pr-4 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand focus:outline-none text-gray-900"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No purchase orders found</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
            const statusStyle = PO_STATUS_LABEL[order.status] || { label: order.status, bg: 'bg-gray-100', color: 'text-gray-500' };
            return (
              <div key={order.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-alpha-10 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand">
                      {(order.supplierName ?? order.number ?? '??').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{order.number ?? order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.supplierName ?? '—'}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {order.total != null ? `₦${order.total.toLocaleString()}` : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
