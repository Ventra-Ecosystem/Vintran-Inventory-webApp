'use client';

import { useEffect, useMemo, useState } from 'react';
import { marketplaceApi, productsApi, locationsApi } from '@/src/lib/api/catalog';
import { salesApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  Search,
  Plus,
  ArrowLeft,
  Check,
  Package,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  Store,
  DollarSign,
  TrendingUp,
  X,
  Filter,
  Eye,
  ShoppingBag,
} from 'lucide-react';

const TABS = ['Overview', 'Product Listing', 'Sales'] as const;
type MarketplaceTab = (typeof TABS)[number];

function fmt(n: number = 0) {
  return `₦${n.toLocaleString()}`;
}

export default function MarketplacePage() {
  const [tab, setTab] = useState<MarketplaceTab>('Overview');

  // Data state
  const [listings, setListings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);

  // Search & Filters
  const [listingSearch, setListingSearch] = useState('');
  const [salesFilter, setSalesFilter] = useState<'all' | 'pending' | 'attributed'>('all');

  // List Product Modal
  const [showListModal, setShowListModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [overridePrice, setOverridePrice] = useState('');
  const [submittingListing, setSubmittingListing] = useState(false);

  // Quantity Edit Modal
  const [editListing, setEditListing] = useState<any>(null);
  const [newQty, setNewQty] = useState('');
  const [updatingQty, setUpdatingQty] = useState(false);

  const fetchListings = () => {
    setLoadingListings(true);
    marketplaceApi
      .list()
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setListings(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  };

  const fetchProducts = () => {
    productsApi
      .list()
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setProducts(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setProducts([]));
  };

  const fetchSales = () => {
    setLoadingSales(true);
    salesApi
      .getReport(new Date(Date.now() - 30 * 86400000).toISOString(), new Date().toISOString())
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setSales(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setSales([]))
      .finally(() => setLoadingSales(false));
  };

  useEffect(() => {
    fetchListings();
    fetchProducts();
    fetchSales();
  }, []);

  const safeListings = useMemo(() => (Array.isArray(listings) ? listings : []), [listings]);
  const safeSales = useMemo(() => (Array.isArray(sales) ? sales : []), [sales]);
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const activeListings = useMemo(
    () => safeListings.filter((l) => l.status !== 'Inactive'),
    [safeListings]
  );

  const totalMarketplaceRevenue = useMemo(() => {
    return safeSales.reduce((sum, s) => sum + (s.grandTotal || s.totalAmount || 0), 0);
  }, [safeSales]);

  const filteredListings = useMemo(() => {
    if (!listingSearch.trim()) return safeListings;
    const q = listingSearch.toLowerCase();
    return safeListings.filter(
      (l) =>
        l.productName?.toLowerCase().includes(q) ||
        l.product?.name?.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q)
    );
  }, [safeListings, listingSearch]);

  const filteredSales = useMemo(() => {
    return safeSales.filter((s) => {
      if (salesFilter === 'pending') return !s.isLocationAssigned;
      if (salesFilter === 'attributed') return s.isLocationAssigned;
      return true;
    });
  }, [safeSales, salesFilter]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      toast.error('Please select a product and quantity');
      return;
    }
    setSubmittingListing(true);
    try {
      await marketplaceApi.create({
        productId: selectedProductId,
        quantity: Number(quantity),
        overridePrice: overridePrice ? Number(overridePrice) : undefined,
      });
      toast.success('Product listed on marketplace!');
      setShowListModal(false);
      setSelectedProductId('');
      setQuantity('1');
      setOverridePrice('');
      fetchListings();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to list product');
    } finally {
      setSubmittingListing(false);
    }
  };

  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editListing || !newQty) return;
    setUpdatingQty(true);
    try {
      await marketplaceApi.updateQuantity(editListing.id, { newQuantity: Number(newQty) });
      toast.success('Listing quantity updated');
      setEditListing(null);
      fetchListings();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update quantity');
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to remove this marketplace listing?')) return;
    try {
      await marketplaceApi.delete(id);
      toast.success('Listing removed');
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      toast.error('Failed to remove listing');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0D14]">Marketplace & Storefront</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your external channels, product listings, and storefront sales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowListModal(true)}
          className="h-10 px-4 rounded-xl bg-brand text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>List Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#F1F5F9]">
        <div className="flex gap-8">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                tab === t ? 'text-[#0055FF]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {tab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EFF5FF] text-[#0055FF] flex items-center justify-center mb-3">
                <ShoppingBag size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Active Listings</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-1">{activeListings.length}</p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                <TrendingUp size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Marketplace Revenue (30d)</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-1">{fmt(totalMarketplaceRevenue)}</p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                <Store size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Channel Orders</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-1">{sales.length}</p>
            </div>
          </div>

          {/* Featured Listings Preview */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0A0D14]">Active Channel Listings</h3>
              <button
                type="button"
                onClick={() => setTab('Product Listing')}
                className="text-xs font-semibold text-[#0055FF] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {listings.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6">
                No active marketplace listings yet. Click &quot;List Product&quot; to publish items.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listings.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055FF] bg-[#EFF5FF] px-2 py-0.5 rounded-md">
                        {item.channelName || 'Storefront'}
                      </span>
                      <p className="text-sm font-bold text-[#0A0D14] mt-2 truncate">
                        {item.productName || item.product?.name || item.title || 'Product'}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">Qty Listed: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#0A0D14] mt-3">
                      {fmt(item.overridePrice || item.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Product Listing Tab ── */}
      {tab === 'Product Listing' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search product listings..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8]"
            />
          </div>

          {loadingListings ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#94A3B8]">No listings found</div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Listed Quantity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#0A0D14]">
                        {item.productName || item.product?.name || item.title}
                      </td>
                      <td className="py-3 px-4 text-[#334155]">{item.quantity}</td>
                      <td className="py-3 px-4 font-bold text-[#0A0D14]">
                        {fmt(item.overridePrice || item.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditListing(item);
                            setNewQty(String(item.quantity));
                          }}
                          className="text-[#0055FF] hover:underline font-semibold cursor-pointer"
                        >
                          Edit Qty
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(item.id)}
                          className="text-[#EF4444] hover:underline font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sales Tab ── */}
      {tab === 'Sales' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {[
              { label: 'All Orders', value: 'all' },
              { label: 'Pending Attribution', value: 'pending' },
              { label: 'Attributed', value: 'attributed' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSalesFilter(filter.value as any)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors',
                  salesFilter === filter.value
                    ? 'bg-[#0055FF] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loadingSales ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading sales...</div>
          ) : filteredSales.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#94A3B8]">No marketplace sales found</div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9] shadow-sm">
              {filteredSales.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#0A0D14]">Order #{s.receiptNumber || s.id.slice(0, 8)}</p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(s.createdAtUtc || s.date || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0A0D14]">{fmt(s.grandTotal || s.totalAmount)}</p>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1",
                      s.isLocationAssigned ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEF3C7] text-[#D97706]"
                    )}>
                      {s.isLocationAssigned ? "Fulfilled" : "Pending Attribution"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── List Product Modal ── */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A0D14]">List Product on Marketplace</h2>
              <button
                type="button"
                onClick={() => setShowListModal(false)}
                className="text-[#94A3B8] hover:text-[#0A0D14]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0D14] mb-1">
                  Select Product *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14]"
                  required
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({fmt(p.sellingPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Quantity to List *"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <Input
                label="Override Price (Optional)"
                type="number"
                placeholder="Leave blank for default selling price"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
              />

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowListModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={submittingListing}>
                  {submittingListing ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Quantity Modal ── */}
      {editListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Update Listing Quantity</h2>
              <button
                type="button"
                onClick={() => setEditListing(null)}
                className="text-[#94A3B8] hover:text-[#0A0D14]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateQuantity} className="space-y-4">
              <Input
                label="New Quantity"
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => setEditListing(null)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={updatingQty}>
                  {updatingQty ? 'Saving...' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
