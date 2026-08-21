'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { useReceiptStore } from '@/src/store/receiptStore';
import { NoticeIcon } from '@/src/assets/icon';
import { stockApi, locationsApi, productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

type DestinationType = 'all' | 'store' | 'warehouse';

export function TransferTab() {
  const router = useRouter();
  const setLastTransfer = useReceiptStore((s) => s.setLastTransfer);

  const [destinationType, setDestinationType] = useState<DestinationType>('all');
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [productId, setProductId] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inStorePrice, setInStorePrice] = useState('');

  useEffect(() => {
    locationsApi.list().then((res: any) => setLocations(toArr(res.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!productQuery) return;
    const t = setTimeout(() => {
      productsApi.list({ search: productQuery }).then((res: any) => {
        setProducts(toArr(res.data));
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const filteredDestinations = locations.filter((l: any) => {
    if (destinationType === 'store') return l.kind === 'Store';
    if (destinationType === 'warehouse') return l.kind === 'Warehouse';
    return true;
  });

  const sourceName = locations.find((l: any) => l.id === sourceId)?.name ?? sourceId;
  const destName = locations.find((l: any) => l.id === destinationId)?.name ?? destinationId;

  const handleConfirm = async () => {
    if (!sourceId) { toast.error('Source location is required'); return; }
    if (!destinationId) { toast.error('Destination location is required'); return; }
    if (!productId) { toast.error('Product is required'); return; }
    if (quantity <= 0) { toast.error('Quantity must be greater than 0'); return; }
    setSubmitting(true);
    try {
      await stockApi.transfer({
        productId,
        sourceLocationId: sourceId,
        destinationLocationId: destinationId,
        quantity,
        inStorePrice: inStorePrice ? Number(inStorePrice) : undefined,
      });
      setLastTransfer({
        destinationType,
        source: sourceName,
        destination: destName,
        product: productQuery,
        quantity: String(quantity),
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to confirm transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setSourceId('');
    setDestinationId('');
    setProductId('');
    setProductQuery('');
    setQuantity(0);
    setInStorePrice('');
  };

  return (
    <>
      <div className="space-y-4 pb-12">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-950">
            Transfer destination type
          </label>
          <SegmentedTabs
            options={[
              { value: 'all', label: 'All' },
              { value: 'store', label: 'To store' },
              { value: 'warehouse', label: 'To warehouse' },
            ]}
            value={destinationType}
            onChange={setDestinationType}
          />
        </div>
        <div className="bg-amber-lighter rounded-[10px] py-4 px-3.5 flex gap-6 items-start">
          <NoticeIcon width={28} />
          <p className="text-[#BB5902] text-sm font-medium">
            Stock must be transferred to a store before it can be sold in-store.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-950 mb-1">Source - From *</p>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white"
          >
            <option value="">Select source location</option>
            {locations.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name} ({l.kind})</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-950 mb-1">Destination - To *</p>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white"
          >
            <option value="">Select destination</option>
            {filteredDestinations.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name} ({l.kind})</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-950 mb-2">Product *</p>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#525866]"
            />
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="h-10 w-full pl-11 pr-4 text-base border border-gray-200 rounded-[10px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            />
          </div>
          {products.length > 0 && productQuery && !productId && (
            <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {products.slice(0, 5).map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                  onClick={() => { setProductId(p.id); setProductQuery(p.name); setProducts([]); }}
                >
                  <span className="font-medium">{p.name}</span>
                  {p.sku && <span className="text-gray-400 ml-2 text-xs">{p.sku}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="In-store price (₦) — for store transfers"
          type="number"
          placeholder="Optional — sets selling price at destination store"
          value={inStorePrice}
          onChange={(e) => setInStorePrice(e.target.value)}
        />

        <QuantityStepper
          label="Quantity to transfer"
          value={quantity}
          onChange={setQuantity}
        />

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Transferring…' : 'Confirm transfer'}
          </Button>
        </div>
      </div>

      {/* Right-Side Drawer Success Screen */}
      <Modal isOpen={showSuccess} onClose={handleDone}>
        <SuccessScreen
          standalone={false}
          title="Transfer Successful!"
          subtitle={`Stock has been transferred from ${sourceName} to ${destName}.`}
          details={[
            { label: 'Product', value: productQuery || 'Stock Item' },
            { label: 'Quantity', value: String(quantity) },
            { label: 'Source', value: sourceName },
            { label: 'Destination', value: destName },
          ]}
          primaryAction={
            <Button fullWidth size="lg" onClick={handleDone}>
              Make another transfer
            </Button>
          }
          secondaryAction={
            <Button variant="secondary" fullWidth size="lg" onClick={() => { handleDone(); router.push('/dashboard'); }}>
              Proceed to dashboard
            </Button>
          }
        />
      </Modal>
    </>
  );
}



