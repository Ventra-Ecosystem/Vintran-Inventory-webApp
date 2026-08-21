'use client';

import { useEffect, useState } from 'react';
import { b2bApi, productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { PlusIcon, PakageIcon } from '@/src/assets/icon';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';

interface MyListingsViewProps {
  onHeaderChange?: (override: any) => void;
  onClearOverride?: () => void;
}

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export function MyListingsView({ onHeaderChange, onClearOverride }: MyListingsViewProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Create form state
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [offersVolumeDiscounts, setOffersVolumeDiscounts] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    b2bApi.getMyListings()
      .then((res: any) => setListings(toArr(res.data)))
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && (err.status === 403 || err.status === 402))) {
          toast.error('Failed to load listings');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  useEffect(() => {
    if (!productQuery) return;
    const t = setTimeout(() => {
      productsApi.list({ search: productQuery })
        .then((res: any) => setProducts(toArr(res.data)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Select a product'); return; }
    if (!quantity || !unitPrice) { toast.error('Quantity and unit price are required'); return; }
    setSaving(true);
    try {
      await b2bApi.createListing({
        productId,
        quantityToList: Number(quantity),
        unitPrice: Number(unitPrice),
        minimumOrderQuantity: Number(minOrderQty) || 1,
        isNegotiable,
        offersVolumeDiscounts,
      });
      setShowCreate(false);
      setShowSuccess(true);
      fetchListings();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelist = async (listing: any) => {
    try {
      await b2bApi.delist(listing.id);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      toast.success('Listing removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to delist');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-alpha-10 border-2 border-brand/20 text-brand font-semibold hover:bg-brand/10 transition-colors"
      >
        <PlusIcon width={18} className="text-brand" />
        Create New Listing
      </button>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-10">
          <PakageIcon width={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No B2B listings yet</p>
          <p className="text-xs text-gray-400 mt-1">Create a listing to start selling to businesses</p>
        </div>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {listings.map((listing: any, idx: number) => (
            <div key={listing.id} className={`px-4 py-3 ${idx < listings.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-default truncate">{listing.productName ?? listing.product ?? '—'}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {fmt(listing.unitPrice)} / unit · Qty: {listing.quantityAvailable ?? listing.quantityToList ?? 0}
                  </p>
                  {listing.isNegotiable && (
                    <span className="text-[10px] font-medium text-brand bg-brand-lighter px-2 py-0.5 rounded-full inline-block mt-1">Negotiable</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelist(listing)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium ml-3 shrink-0"
                >
                  Delist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-text-default">New B2B Listing</h2>
            <p className="text-xs text-text-muted mt-0.5">List a product for sale to other businesses</p>
          </div>
          <button type="button" onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-subtle">✕</button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#0A0D14] mb-1 block">Product *</label>
            <input
              value={productQuery}
              onChange={(e) => { setProductQuery(e.target.value); setProductId(''); }}
              placeholder="Search product by name…"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
            {products.length > 0 && !productId && (
              <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {products.slice(0, 5).map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                    onClick={() => { setProductId(p.id); setProductQuery(p.name); setProducts([]); }}
                  >
                    {p.name} {p.sku ? <span className="text-gray-400 text-xs ml-1">{p.sku}</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Quantity *</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Unit Price (₦) *</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Min Order Quantity</label>
            <input type="number" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="1" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-text-default cursor-pointer">
              <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="accent-brand" />
              Negotiable
            </label>
            <label className="flex items-center gap-2 text-sm text-text-default cursor-pointer">
              <input type="checkbox" checked={offersVolumeDiscounts} onChange={(e) => setOffersVolumeDiscounts(e.target.checked)} className="accent-brand" />
              Volume Discounts
            </label>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={saving}>
            {saving ? 'Creating…' : 'Create Listing'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <SuccessScreen
          standalone={false}
          title="Listing Created!"
          subtitle="Your product is now listed for B2B buyers."
          primaryAction={<Button fullWidth size="lg" onClick={() => setShowSuccess(false)}>Done</Button>}
        />
      </Modal>
    </div>
  );
}
