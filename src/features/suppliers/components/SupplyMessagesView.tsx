'use client';

import { useEffect, useRef, useState } from 'react';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { Send } from 'lucide-react';

export function SupplyMessagesView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

  const loadOrderDetail = (order: any) => {
    setSelected(order);
    b2bApi.getOrder(order.id)
      .then((res: any) => setOrderDetail(res.data ?? null))
      .catch(() => setOrderDetail(null));
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setSelected(null); setOrderDetail(null); }} className="text-sm text-brand font-medium">← Back</button>
        <div className="bg-bg-surface rounded-xl p-4">
          <p className="text-sm font-bold text-text-default">{selected.number ?? selected.id}</p>
          <p className="text-xs text-text-muted mb-3">{selected.buyerBusinessName ?? '—'}</p>
          {(orderDetail?.lines ?? []).map((line: any, idx: number) => (
            <div key={line.id ?? idx} className="flex items-center justify-between py-2 border-b border-[#9B9EA34D] last:border-0">
              <p className="text-sm text-text-default">{line.productName ?? '—'}</p>
              <p className="text-sm font-semibold text-text-default">×{line.quantity}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">Messaging for B2B orders coming soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-text-default">B2B Order Conversations</p>
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-6">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No orders yet</p>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {orders.map((order: any, idx: number) => (
            <button
              key={order.id}
              type="button"
              onClick={() => loadOrderDetail(order)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left ${idx < orders.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-sm shrink-0">
                {(order.buyerBusinessName ?? order.number ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-default truncate">{order.number ?? order.id}</p>
                <p className="text-xs text-text-muted truncate">{order.buyerBusinessName ?? '—'} · {order.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
