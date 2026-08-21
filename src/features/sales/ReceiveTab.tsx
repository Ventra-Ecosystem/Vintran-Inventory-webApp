'use client';

import { useState, useEffect, useMemo } from 'react';
import { productsApi, locationsApi, stockApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import {
  AlertCircle,
  Plus,
  Search,
  Package,
  Store,
  Calendar,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { NigeriaIcon } from '@/src/assets/icon';

type Step = 'main' | 'product_select' | 'receive_form' | 'success';

interface ReceiptResult {
  stockEntryId: string;
  destination: string;
  product: string;
  quantity: number;
}

export function ReceiveTab() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('main');

  // Locations & Products
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [showDestModal, setShowDestModal] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // Recent receipts (main screen)
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState('1');
  const [batch, setBatch] = useState('');
  const [cost, setCost] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(null);

  // Fetch Locations
  useEffect(() => {
    locationsApi
      .list()
      .then((res: any) => {
        const list = res.data?.items ?? res.data ?? res ?? [];
        if (Array.isArray(list)) {
          setLocations(list);
          if (list.length > 0) setSelectedLocationId(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch recent receipts whenever main screen is shown
  useEffect(() => {
    if (step !== 'main') return;
    setReceiptsLoading(true);
    stockApi
      .listMovements({ kind: 'Receipt', limit: 15 })
      .then((res: any) => {
        const list = res.data?.items ?? res.data ?? res ?? [];
        setRecentReceipts(Array.isArray(list) ? list : []);
      })
      .catch(() => setRecentReceipts([]))
      .finally(() => setReceiptsLoading(false));
  }, [step]);

  // Fetch products (for product_select step)
  const fetchProducts = () => {
    setProductsLoading(true);
    productsApi
      .list({ search: productSearch.trim() || undefined, pageSize: 100 })
      .then((res: any) => {
        const list = res.data?.items ?? res.data ?? res ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [productSearch]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId]
  );

  const handleSelectProduct = (p: any) => {
    setSelectedProduct(p);
    setQty('1');
    setBatch('');
    setCost(p.unitCost ? String(p.unitCost) : '');
    setExpiryDate('');
    setStep('receive_form');
  };

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (!selectedLocationId) {
      toast.error('Please select a destination location');
      return;
    }
    if (!cost) {
      toast.error('Cost per unit is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await stockApi.receive({
        productId: selectedProduct.id,
        locationId: selectedLocationId,
        quantity,
        unitCost: Number(cost),
        batchReference: batch.trim() || undefined,
      });

      const entryId = batch.trim()
        ? `#REC-${batch.trim()}`
        : `#REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

      setReceiptResult({
        stockEntryId: entryId,
        destination: selectedLocation?.name ?? '—',
        product: selectedProduct?.name ?? '—',
        quantity,
      });

      setStep('success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to receive stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 1. SUCCESS SCREEN ──────────────────────────────────────────────────────
  if (step === 'success' && receiptResult) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-[#EFF5FF] flex items-center justify-center mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#0055FF] flex items-center justify-center text-white">
            <Check size={32} strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#0A0D14]">Receipt Confirmed</h2>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 divide-y divide-[#F1F5F9] text-xs text-left shadow-sm">
          <div className="flex justify-between py-3">
            <span className="text-[#64748B]">Stock Entry ID</span>
            <span className="font-bold text-[#0055FF]">{receiptResult.stockEntryId}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-[#64748B]">Destination</span>
            <span className="font-semibold text-[#0A0D14]">{receiptResult.destination}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-[#64748B]">Product</span>
            <span className="font-semibold text-[#0A0D14]">{receiptResult.product}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-[#64748B]">Updated warehouse stock</span>
            <span className="font-semibold text-[#0A0D14]">{receiptResult.quantity} units</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => { setStep('main'); setReceiptResult(null); }}
            className="w-full h-12 rounded-xl bg-[#0055FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            + Receive Another Product
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full h-12 rounded-xl bg-[#EFF5FF] text-[#0055FF] font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Proceed to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── 2. RECEIVE FORM ────────────────────────────────────────────────────────
  if (step === 'receive_form') {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setStep('product_select')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-[#0A0D14]">{selectedProduct?.name}</h2>
        </div>

        <form onSubmit={handleConfirmReceipt} className="space-y-5">
          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Destination
            </label>
            <div className="flex items-center justify-between bg-[#EFF5FF] border border-[#0055FF]/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0055FF] shadow-sm">
                  <Store size={20} />
                </div>
                <span className="text-sm font-bold text-[#0A0D14]">
                  {selectedLocation?.name ?? 'Select destination'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDestModal(true)}
                className="text-xs font-semibold text-[#0055FF] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>

          {/* Quantity received */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0D14] mb-1.5">
              Quantity received
            </label>
            <div className="flex gap-3">
              <div className="flex-1 border border-[#E2E8F0] rounded-xl px-4 h-12 flex items-center bg-white">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min="1"
                  className="w-full font-semibold text-base text-[#0A0D14] bg-transparent focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shrink-0 h-12">
                <button
                  type="button"
                  onClick={() => setQty(String(Math.max(1, Number(qty) - 1)))}
                  className="w-12 h-full flex items-center justify-center text-xl text-[#64748B] hover:bg-gray-50 border-r border-[#E2E8F0] cursor-pointer"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setQty(String(Number(qty) + 1))}
                  className="w-12 h-full flex items-center justify-center text-xl text-[#64748B] hover:bg-gray-50 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Batch / Lot ref. */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0D14] mb-1.5">
              Batch / Lot ref. (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. BT-2026-07A"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full h-12 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8] bg-white focus:outline-none focus:border-brand"
            />
          </div>

          {/* Expiry date */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0D14] mb-1.5">
              Expiry date (If applicable)
            </label>
            <div className="relative">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-12 px-4 pr-10 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-white focus:outline-none focus:border-brand"
              />
              <Calendar size={18} className="absolute right-3.5 top-3.5 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Cost per unit */}
          <div>
            <label className="block text-xs font-semibold text-[#0A0D14] mb-1.5">
              Cost per unit (₦) <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative flex items-center border border-[#E2E8F0] rounded-xl bg-white px-3.5 h-12">
              <div className="flex items-center gap-2 pr-3 border-r border-[#E2E8F0] mr-3 shrink-0">
                <NigeriaIcon width={20} height={20} />
                <span className="text-xs font-semibold text-[#0A0D14]">NGN</span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-sm font-semibold text-[#0A0D14] placeholder-[#94A3B8] bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#0055FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Receipt'}
            </button>
            <button
              type="button"
              onClick={() => setStep('product_select')}
              className="w-full h-12 rounded-xl bg-[#EFF5FF] text-[#0055FF] font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Change Destination Modal */}
        {showDestModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A0D14]">Change Destination</h3>
                  <p className="text-xs text-[#64748B]">Select where the product is located.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDestModal(false)}
                  className="text-[#94A3B8] hover:text-[#0A0D14]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {locations.map((loc) => {
                  const isSelected = selectedLocationId === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocationId(loc.id)}
                      className={cn(
                        'p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-[#EFF5FF] border-[#0055FF]'
                          : 'bg-[#F8FAFC] border-[#F1F5F9] hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Store size={22} className={isSelected ? 'text-[#0055FF]' : 'text-[#64748B]'} />
                        <div>
                          <p className="text-sm font-bold text-[#0A0D14]">{loc.name}</p>
                          <p className="text-xs text-[#64748B]">
                            {loc.kind === 'Store' ? 'In-store warehouse' : loc.kind}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-[#0055FF] bg-[#0055FF]' : 'border-[#CBD5E1] bg-white'
                        )}
                      >
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowDestModal(false)}
                className="w-full h-12 rounded-xl bg-[#0055FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 3. PRODUCT SELECTION LIST ────────────────────────────────────────────────
  if (step === 'product_select') {
    return (
      <div className="space-y-5 pb-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('main')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-[#0A0D14]">Receive Stock</h2>
        </div>

        {/* Info banner */}
        <div className="bg-[#EFF5FF] border border-[#0055FF]/10 rounded-2xl p-4 flex items-start gap-3 text-[#0055FF] text-xs leading-relaxed">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>
            Select the product being received. If the product does not exist yet, create it first before logging the goods receipt.
          </span>
        </div>

        {/* Add Product button */}
        <Link
          href="/product"
          className="w-full h-12 rounded-xl bg-white border-2 border-[#0055FF] text-[#0055FF] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </Link>

        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search products by name or SKU"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-brand"
          />
        </div>

        {/* Products Header */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-base font-bold text-[#0A0D14]">Products</h3>
          <Link href="/product" className="text-xs font-semibold text-[#0055FF] hover:underline">
            View all
          </Link>
        </div>

        {/* Product List */}
        {productsLoading ? (
          <div className="py-12 text-center text-sm text-[#64748B]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#94A3B8]">
            {productSearch ? 'No products match your search' : 'No products found. Add a product first.'}
          </div>
        ) : (
          <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9]">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] text-[#0055FF] flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0A0D14]">{p.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {p.sku ? `${p.sku} · ` : ''}{p.category ?? 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#0A0D14]">
                    {p.totalStock !== undefined ? `${p.totalStock} units` : '— units'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── 4. MAIN SCREEN ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-12 max-w-2xl mx-auto">
      {/* Info banner */}
      <div className="bg-[#EFF5FF] border border-[#DBEAFE] rounded-xl p-3.5 flex items-start gap-3">
        <AlertCircle size={18} className="text-[#0055FF] shrink-0 mt-0.5" />
        <span className="text-sm text-[#0A0D14]">Record stock received into a store or warehouse</span>
      </div>

      {/* Receive Stock CTA */}
      <button
        type="button"
        onClick={() => setStep('product_select')}
        className="w-full h-12 rounded-xl bg-[#EFF5FF] border-[1.5px] border-[#DBEAFE] text-[#0055FF] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <Plus size={18} />
        Receive Stock
      </button>

      {/* Recent Receipts header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-base font-semibold text-[#0A0D14]">Recent Receipts</h3>
      </div>

      {/* Recent Receipts list */}
      {receiptsLoading ? (
        <div className="py-8 text-center text-sm text-[#94A3B8]">Loading...</div>
      ) : recentReceipts.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#94A3B8]">No stock received yet</div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {recentReceipts.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              {/* Green check icon */}
              <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Check size={16} className="text-[#16A34A]" strokeWidth={2.5} />
              </div>
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0D14] truncate">
                  {m.productName ?? m.product ?? '—'}
                </p>
                <p className="text-xs text-[#94A3B8] truncate">{m.sku ?? m.productSku ?? ''}</p>
              </div>
              {/* Qty + location */}
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-[#0A0D14]">
                  +{m.quantityDelta ?? m.quantity ?? 0} units
                </p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <Store size={11} className="text-[#64748B]" />
                  <span className="text-xs text-[#16A34A]">{m.locationName ?? '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
