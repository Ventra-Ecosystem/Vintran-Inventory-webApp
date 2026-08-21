'use client';

import { useEffect, useState } from 'react';
import { Search, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { stockApi, locationsApi, productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr, cn } from '@/src/lib/utils';
import { PakageIcon, WareHouseIcon } from '@/src/assets/icon';
import { NoticeIcon } from '@/src/assets/icon';
import Link from 'next/link';

type Step = 'main' | 'form' | 'success';

interface ReceiptResult {
  destination: string;
  product: string;
  quantity: number;
  batchRef: string;
}

export function ReceiveTab() {
  const [step, setStep] = useState<Step>('main');
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form state
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReceiptResult | null>(null);

  useEffect(() => {
    locationsApi.list()
      .then((res: any) => {
        const locs = toArr(res.data);
        setLocations(locs);
        if (locs.length > 0 && !locationId) setLocationId(locs[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setProductsLoading(true);
      productsApi.list({ search: productSearch, pageSize: 50 })
        .then((res: any) => setProducts(toArr(res.data)))
        .catch(() => {})
        .finally(() => setProductsLoading(false));
    }, productSearch ? 300 : 0);
    return () => clearTimeout(t);
  }, [productSearch]);

  const selectedLocation = locations.find((l: any) => l.id === locationId);

  const handleSelectProduct = (p: any) => {
    setSelectedProduct(p);
    setQuantity(1);
    setBatchNo('');
    setExpiryDate('');
    setCostPerUnit('');
    setStep('form');
  };

  const handleConfirm = async () => {
    if (!quantity || quantity <= 0) { toast.error('Quantity must be greater than 0'); return; }
    if (!locationId) { toast.error('Please select a destination location'); return; }
    setSubmitting(true);
    try {
      await stockApi.receive({
        productId: selectedProduct.id,
        locationId,
        quantity,
        unitCost: costPerUnit ? Number(costPerUnit) : undefined,
        batchReference: batchNo || undefined,
      });
      setResult({
        destination: selectedLocation?.name ?? '—',
        product: selectedProduct?.name ?? '—',
        quantity,
        batchRef: batchNo || '—',
      });
      setStep('success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('main');
    setSelectedProduct(null);
    setResult(null);
    setQuantity(1);
    setBatchNo('');
    setExpiryDate('');
    setCostPerUnit('');
  };

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (step === 'success' && result) {
    return (
      <div className="space-y-4 pb-12">
        <SuccessScreen
          standalone={false}
          title="Receipt Confirmed"
          subtitle="Stock has been received into inventory."
          details={[
            { label: 'Destination', value: result.destination },
            { label: 'Product', value: result.product },
            { label: 'Quantity', value: `${result.quantity} units` },
            { label: 'Batch Ref', value: result.batchRef },
          ]}
          primaryAction={
            <Button fullWidth size="lg" onClick={handleReset}>
              + Receive Another Product
            </Button>
          }
          secondaryAction={
            <Button variant="secondary" fullWidth size="lg" onClick={handleReset}>
              Back to overview
            </Button>
          }
        />
      </div>
    );
  }

  // ── RECEIVE FORM ──────────────────────────────────────────────────────────
  if (step === 'form' && selectedProduct) {
    return (
      <div className="space-y-4 pb-12">
        <button type="button" onClick={() => setStep('main')} className="flex items-center gap-2 text-sm font-medium text-brand">
          <ArrowLeft size={16} /> Back to product list
        </button>

        <h2 className="text-xl font-bold text-[#0A0D14]">{selectedProduct.name}</h2>

        {/* Destination picker */}
        <div>
          <p className="text-xs font-medium text-text-muted mb-1.5">Destination</p>
          <div className="flex items-center justify-between bg-brand-lighter rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-3">
              <WareHouseIcon width={20} className="text-brand" />
              <p className="text-sm font-bold text-[#0A0D14]">{selectedLocation?.name ?? 'Select destination'}</p>
            </div>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="text-sm font-medium text-brand bg-transparent border-none outline-none cursor-pointer"
            >
              {locations.map((l: any) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity */}
        <QuantityStepper label="Quantity received" value={quantity} onChange={setQuantity} />

        {/* Batch + Expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#0A0D14]">Batch / Lot ref. (Optional)</label>
            <input
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              placeholder="e.g. BT-2026-07A"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#0A0D14]">Expiry date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* Cost per unit */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#0A0D14]">Cost per unit (₦) *</label>
          <input
            type="number"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            placeholder="0.00"
            className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth size="lg" type="button" onClick={() => setStep('main')}>Cancel</Button>
          <Button variant="primary" fullWidth size="lg" type="button" disabled={submitting} onClick={handleConfirm}>
            {submitting ? 'Saving…' : 'Confirm Receipt'}
          </Button>
        </div>
      </div>
    );
  }

  // ── MAIN: Product list ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-12">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-brand-lighter rounded-2xl px-4 py-3.5 border border-brand/10">
        <NoticeIcon width={20} className="text-brand shrink-0 mt-0.5" />
        <p className="text-sm text-brand leading-relaxed">
          Select the product being received. If it doesn't exist yet, create it first.
        </p>
      </div>

      {/* Add product CTA */}
      <Link href="/product" className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-brand text-brand font-semibold text-sm hover:bg-brand-lighter transition-colors">
        <Plus size={18} /> Add Product
      </Link>

      {/* Product search */}
      <div className="flex items-center h-11 bg-[#F8FAFC] rounded-full px-4 gap-3 border border-gray-200">
        <Search size={16} className="text-[#94A3B8] shrink-0" />
        <input
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products SKU or category"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
        />
      </div>

      {/* Products */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#0A0D14]">Products</p>
        <Link href="/product" className="text-sm font-medium text-brand">View all</Link>
      </div>

      {productsLoading ? (
        <p className="text-sm text-text-muted text-center py-8">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">
          {productSearch ? 'No products match your search' : 'No products yet. Add products first.'}
        </p>
      ) : (
        <div className="space-y-0">
          {products.map((p: any) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectProduct(p)}
              className="w-full flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center shrink-0">
                  <PakageIcon width={22} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0D14]">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.category ?? 'Uncategorized'}{p.subcategory ? ` / ${p.subcategory}` : ''}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-brand shrink-0">Select</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
