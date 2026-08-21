'use client';

import { useEffect, useState } from 'react';
import { b2bApi, locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';

export function DeliveryView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [locationId, setLocationId] = useState('');
  const [shipping, setShipping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      b2bApi.getIncomingOrders('Processing'),
      locationsApi.list(),
    ]).then(([ordersRes, locsRes]: any[]) => {
      setOrders(toArr(ordersRes.data));
      setLocations(toArr(locsRes.data));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleShip = async () => {
    if (!selected || !locationId) { toast.error('Select an order and source location'); return; }
    setShipping(true);
    try {
      const lines = (selected.lines ?? []).map((l: any) => ({ lineId: l.id, quantityShipped: l.quantity }));
      await b2bApi.shipOrder(selected.id, { sourceLocationId: locationId, lines });
      toast.success('Order shipped');
      setOrders((prev) => prev.filter((o) => o.id !== selected.id));
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to ship order');
    } finally {
      setShipping(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <p className="text-sm font-semibold text-text-default">Orders Ready to Ship</p>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-6">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No orders pending delivery</p>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {orders.map((order: any, idx: number) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelected(order)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors ${idx < orders.length - 1 ? 'border-b border-[#9B9EA34D]' : ''} ${selected?.id === order.id ? 'bg-brand-lighter' : ''}`}
            >
              <div>
                <p className="text-sm font-semibold text-text-default">{order.number ?? order.id}</p>
                <p className="text-xs text-text-muted">{order.buyerBusinessName ?? '—'} · {order.lines?.length ?? 0} line(s)</p>
              </div>
              <span className="text-xs font-bold text-brand">{selected?.id === order.id ? '✓ Selected' : 'Select'}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Source Location *</p>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white"
            >
              <option value="">Select source location</option>
              {locations.map((l: any) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <Button fullWidth size="lg" disabled={!locationId || shipping} onClick={handleShip}>
            {shipping ? 'Shipping…' : 'Confirm Shipment'}
          </Button>
        </div>
      )}

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); setSelected(null); setLocationId(''); }}>
        <SuccessScreen
          standalone={false}
          title="Order Shipped!"
          subtitle="The order has been shipped to the buyer."
          primaryAction={
            <Button fullWidth size="lg" onClick={() => { setShowSuccess(false); setSelected(null); setLocationId(''); }}>Done</Button>
          }
        />
      </Modal>
    </div>
  );
}
