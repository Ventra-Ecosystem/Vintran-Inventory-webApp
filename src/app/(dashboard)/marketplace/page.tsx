'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { marketplaceApi, locationsApi, productsApi } from '@/src/lib/api/catalog';
import { salesApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import {
  Search,
  Plus,
  ArrowLeft,
  Package,
  CheckCircle2,
  AlertCircle,
  Store,
  TrendingUp,
  X,
  ShoppingBag,
  Link2,
  Edit2,
  ChevronRight,
  PieChart,
} from 'lucide-react';

const BLUE = '#0055FF';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
const TABS = ['Overview', 'Product Listing', 'Sales'] as const;
type MarketplaceTab = (typeof TABS)[number];
type AttributionFilter = 'all' | 'pending' | 'attributed';

function fmt(n: number = 0) {
  return `\u20a6${n.toLocaleString()}`;
}

// Normalize raw sale so isLocationAssigned and createdOnUtc are always present
function normalizeSale(s: any): any {
  return {
    ...s,
    isLocationAssigned: s.isLocationAssigned ?? (!!s.locationId && s.locationId !== EMPTY_GUID),
    createdOnUtc: s.createdOnUtc ?? s.occurredOnUtc ?? '',
  };
}

export default function MarketplacePage() {
  const [tab, setTab] = useState<MarketplaceTab>('Overview');
  const [listings, setListings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [listingSearch, setListingSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState<AttributionFilter>('all');
  const [showListFlow, setShowListFlow] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const fetchListings = useCallback(() => {
    setLoadingListings(true);
    marketplaceApi.list({ includePaused: true })
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setListings(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, []);

  const fetchChannels = useCallback(() => {
    marketplaceApi.listChannels()
      .then((res: any) => {
        const raw = res.data ?? res ?? [];
        setChannels(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setChannels([]));
  }, []);

  const fetchProducts = useCallback(() => {
    productsApi.list({ pageSize: 200 })
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setProducts(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setProducts([]));
  }, []);

  const fetchSales = useCallback(() => {
    setLoadingSales(true);
    salesApi.list({ channel: 'Marketplace', pageSize: 50 })
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setSales((Array.isArray(raw) ? raw : []).map(normalizeSale));
      })
      .catch(() => setSales([]))
      .finally(() => setLoadingSales(false));
  }, []);

  const fetchLocations = useCallback(() => {
    locationsApi.list()
      .then((res: any) => {
        const raw = res.data ?? res ?? [];
        setLocations(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    fetchListings();
    fetchChannels();
    fetchProducts();
    fetchSales();
    fetchLocations();
  }, [fetchListings, fetchChannels, fetchProducts, fetchSales, fetchLocations]);

  const stores = useMemo(() => locations.filter((l: any) => l.kind === 'Store'), [locations]);

  const productMap = useMemo(() => {
    const m = new Map<string, any>();
    products.forEach((p: any) => m.set(p.id, p));
    return m;
  }, [products]);

  const activeListings = useMemo(() => listings.filter((l: any) => l.status === 'Active'), [listings]);
  const totalRevenue = useMemo(() => sales.reduce((sum: number, s: any) => sum + (s.grandTotal ?? 0), 0), [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s: any) => {
      if (attrFilter === 'pending') return !s.isLocationAssigned;
      if (attrFilter === 'attributed') return s.isLocationAssigned;
      return true;
    });
  }, [sales, attrFilter]);

  const visibleListings = useMemo(() => {
    return listings
      .filter((l: any) => l.status !== 'Removed')
      .filter((l: any) => {
        if (channelFilter !== 'all') {
          const ids: string[] = l.channelIds ?? [];
          if (!ids.includes(channelFilter)) return false;
        }
        if (!listingSearch.trim()) return true;
        const p = productMap.get(l.productId);
        const q = listingSearch.toLowerCase();
        return (
          (p?.name?.toLowerCase().includes(q) ?? false) ||
          (p?.sku?.toLowerCase().includes(q) ?? false) ||
          (l.referenceCode?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [listings, channelFilter, listingSearch, productMap]);

  const stats = [
    { label: 'Marketplace Orders', value: String(sales.length), icon: ShoppingBag, color: BLUE, bg: '#EFF5FF' },
    { label: 'Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: GREEN, bg: '#DCFCE7' },
    { label: 'Active Listings', value: String(activeListings.length), icon: PieChart, color: AMBER, bg: '#FFF7ED' },
    { label: 'Active Channels', value: String(channels.length), icon: Store, color: '#7C3AED', bg: '#F5F3FF' },
  ];

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
          onClick={() => setShowListFlow(true)}
          className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>List a Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0]">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'mr-6 py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                tab === t ? 'text-[#0A0D14]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {tab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Overview' && (
        <OverviewTab
          stats={stats}
          filteredSales={filteredSales}
          attrFilter={attrFilter}
          onChangeFilter={setAttrFilter}
          isLoading={loadingListings || loadingSales}
          onSelectSale={(id) => setSelectedSaleId(id)}
        />
      )}
      {tab === 'Product Listing' && (
        <ProductListingTab
          listings={visibleListings}
          productMap={productMap}
          channels={channels}
          channelFilter={channelFilter}
          onChangeChannelFilter={setChannelFilter}
          search={listingSearch}
          onChangeSearch={setListingSearch}
          isLoading={loadingListings}
          onListProduct={() => setShowListFlow(true)}
          onOpenListing={(l) => setSelectedListing(l)}
        />
      )}
      {tab === 'Sales' && (
        <SalesTab
          sales={filteredSales}
          attrFilter={attrFilter}
          onChangeFilter={setAttrFilter}
          isLoading={loadingSales}
          onSelectSale={(id) => setSelectedSaleId(id)}
        />
      )}

      {showListFlow && (
        <ListProductFlowPanel
          products={products}
          listings={listings}
          channels={channels}
          stores={stores}
          onClose={() => setShowListFlow(false)}
          onSuccess={() => { fetchListings(); fetchChannels(); }}
        />
      )}
      {selectedListing && (
        <ListedProductPanel
          listing={selectedListing}
          product={productMap.get(selectedListing.productId)}
          channels={channels}
          onClose={() => setSelectedListing(null)}
          onSuccess={() => { fetchListings(); setSelectedListing(null); }}
        />
      )}
      {selectedSaleId && (
        <SaleDetailPanel
          saleId={selectedSaleId}
          stores={stores}
          onClose={() => setSelectedSaleId(null)}
          onSuccess={() => fetchSales()}
        />
      )}
    </div>
  );
}

// ─── SlideOver wrapper ────────────────────────────────────────────────────────
function SlideOver({
  open,
  onClose,
  children,
  width = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          width,
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {children}
      </div>
    </>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  stats,
  filteredSales,
  attrFilter,
  onChangeFilter,
  isLoading,
  onSelectSale,
}: {
  stats: any[];
  filteredSales: any[];
  attrFilter: AttributionFilter;
  onChangeFilter: (f: AttributionFilter) => void;
  isLoading: boolean;
  onSelectSale: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-[#0A0D14]">{s.value}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
        <p className="text-[15px] font-semibold text-[#0A0D14] mb-3">Recent Orders</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending attribution' },
            { key: 'attributed', label: 'Attributed' },
          ] as const).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onChangeFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors',
                attrFilter === f.key
                  ? 'bg-[#0055FF] text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-[#64748B]">Loading...</div>
        ) : filteredSales.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-6">No marketplace orders yet</p>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredSales.slice(0, 5).map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSale(s.id)}
                className="w-full flex items-center gap-3 py-3 hover:bg-[#F8FAFC] rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] flex items-center justify-center shrink-0">
                  <Package size={18} color={BLUE} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-[#0A0D14] truncate">{s.number}</p>
                  <p className="text-xs text-[#64748B]">
                    {s.customerName ?? 'Walk-in'} &middot; {s.itemCount} units
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#0A0D14]">{fmt(s.grandTotal)}</p>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: s.isLocationAssigned ? GREEN : AMBER }}
                  >
                    {s.isLocationAssigned ? 'Attributed' : 'Pending attribution'}
                  </span>
                </div>
                <ChevronRight size={14} className="text-[#CBD5E1] shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Listing Tab ──────────────────────────────────────────────────────
function ProductListingTab({
  listings,
  productMap,
  channels,
  channelFilter,
  onChangeChannelFilter,
  search,
  onChangeSearch,
  isLoading,
  onListProduct,
  onOpenListing,
}: {
  listings: any[];
  productMap: Map<string, any>;
  channels: any[];
  channelFilter: string;
  onChangeChannelFilter: (id: string) => void;
  search: string;
  onChangeSearch: (v: string) => void;
  isLoading: boolean;
  onListProduct: () => void;
  onOpenListing: (l: any) => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onListProduct}
        className="w-full flex items-center justify-center gap-2 bg-[#EFF5FF] text-[#0055FF] rounded-xl py-3 text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <Plus size={15} />
        List a Product
      </button>

      {channels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChangeChannelFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors',
              channelFilter === 'all' ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
            )}
          >
            All channels
          </button>
          {channels.map((c: any) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChangeChannelFilter(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors',
                channelFilter === c.id ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
        />
      </div>

      <p className="text-xs text-[#64748B]">Listings ({listings.length} items)</p>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#64748B]">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#94A3B8]">No listings found</div>
      ) : (
        <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
          {listings.map((l: any, i: number) => {
            const p = productMap.get(l.productId);
            const isActive = l.status === 'Active';
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onOpenListing(l)}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 hover:bg-white transition-colors cursor-pointer text-left',
                  i < listings.length - 1 ? 'border-b border-[#EAECF0]' : ''
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] flex items-center justify-center shrink-0">
                  <Package size={18} color={BLUE} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0A0D14] truncate">{p?.name ?? l.referenceCode}</p>
                  <p className="text-xs text-[#64748B]">
                    {p?.sku ?? l.referenceCode} &middot; {l.listedQuantity} units listed
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-sm font-bold text-[#0A0D14]">{fmt(l.effectivePrice)}</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? '#DCFCE7' : '#FFF7ED',
                      color: isActive ? GREEN : AMBER,
                    }}
                  >
                    {isActive ? 'LIVE' : l.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────────
function SalesTab({
  sales,
  attrFilter,
  onChangeFilter,
  isLoading,
  onSelectSale,
}: {
  sales: any[];
  attrFilter: AttributionFilter;
  onChangeFilter: (f: AttributionFilter) => void;
  isLoading: boolean;
  onSelectSale: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending attribution' },
          { key: 'attributed', label: 'Attributed' },
        ] as const).map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => onChangeFilter(pill.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors',
              attrFilter === pill.key ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[#64748B]">Loading sales...</div>
      ) : sales.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#94A3B8]">No marketplace orders</div>
      ) : (
        <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9] shadow-sm">
          {sales.map((s: any) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSale(s.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0A0D14] flex items-center justify-center shrink-0">
                <Package size={18} color="#FFFFFF" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0D14]">{s.number}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {s.customerName ?? 'Walk-in'} &middot; {s.itemCount} units
                </p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-sm font-bold text-[#0A0D14]">{fmt(s.grandTotal)}</p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
                  style={{
                    backgroundColor: s.isLocationAssigned ? '#DCFCE7' : '#FFF7ED',
                    color: s.isLocationAssigned ? GREEN : AMBER,
                  }}
                >
                  {s.isLocationAssigned ? 'Attributed' : 'Pending attribution'}
                </span>
              </div>
              <ChevronRight size={14} className="text-[#CBD5E1] shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── List Product Flow Panel ──────────────────────────────────────────────────
type ProductConfig = {
  quantity: string;
  description: string;
  priceMode: 'custom' | 'inStore';
  customPrice: string;
};

function ListProductFlowPanel({
  products,
  listings,
  channels: initialChannels,
  stores,
  onClose,
  onSuccess,
}: {
  products: any[];
  listings: any[];
  channels: any[];
  stores: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [flowStep, setFlowStep] = useState<'select' | 'destination' | 'success'>('select');
  const [search, setSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productConfigs, setProductConfigs] = useState<Record<string, ProductConfig>>({});
  const [configProduct, setConfigProduct] = useState<any>(null);
  const [cfgQty, setCfgQty] = useState('');
  const [cfgDesc, setCfgDesc] = useState('');
  const [cfgPriceMode, setCfgPriceMode] = useState<'custom' | 'inStore'>('custom');
  const [cfgCustomPrice, setCfgCustomPrice] = useState('');
  const [fulfillingStoreId, setFulfillingStoreId] = useState<string | null>(null);
  const [moq, setMoq] = useState('1');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [channels, setChannels] = useState<any[]>(initialChannels);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  const listingByProduct = useMemo(() => {
    const m = new Map<string, any>();
    listings.forEach((l: any) => {
      if (l.status !== 'Removed') m.set(l.productId, l);
    });
    return m;
  }, [listings]);

  const eligibleProducts = products
    .filter((p: any) => p.channels !== 'InStore')
    .filter((p: any) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    });

  const openConfigFor = (prod: any) => {
    const existing = productConfigs[prod.id];
    setCfgQty(existing?.quantity ?? '');
    setCfgDesc(existing?.description ?? '');
    setCfgPriceMode(existing?.priceMode ?? 'custom');
    setCfgCustomPrice(existing?.customPrice ?? '');
    setConfigProduct(prod);
  };

  const confirmConfig = () => {
    if (!configProduct || !cfgQty.trim()) return;
    setProductConfigs((prev) => ({
      ...prev,
      [configProduct.id]: { quantity: cfgQty, description: cfgDesc, priceMode: cfgPriceMode, customPrice: cfgCustomPrice },
    }));
    setSelectedProductIds((prev) =>
      prev.includes(configProduct.id) ? prev : [...prev, configProduct.id]
    );
    setConfigProduct(null);
  };

  const removeFromList = (id: string) => {
    setSelectedProductIds((prev) => prev.filter((i) => i !== id));
    setProductConfigs((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    setCreatingChannel(true);
    try {
      const res: any = await marketplaceApi.createChannel({ name: newChannelName.trim(), kind: 'Marketplace' });
      const created = res.data ?? res;
      setChannels((prev) => [...prev, created]);
      setSelectedChannelIds((prev) => [...prev, created.id]);
      setNewChannelName('');
      setShowNewChannel(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create channel');
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleSubmit = async () => {
    if (!fulfillingStoreId) return;
    const lines = selectedProductIds.map((id) => {
      const cfg = productConfigs[id];
      return {
        productId: id,
        quantity: Number(cfg.quantity) || 0,
        overridePrice: cfg.priceMode === 'custom' && cfg.customPrice ? Number(cfg.customPrice) : undefined,
        description: cfg.description || undefined,
      };
    });
    setLastCount(lines.length);
    setSubmitting(true);
    try {
      await marketplaceApi.bulkCreate({
        lines,
        fulfillingStoreId,
        minimumOrderQuantity: Number(moq) || 1,
        channelIds: selectedChannelIds,
      });
      setFlowStep('success');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlideOver open width="max-w-lg" onClose={onClose}>
      {flowStep === 'success' ? (
        <ListProductSuccess
          count={lastCount}
          storeName={stores.find((s) => s.id === fulfillingStoreId)?.name}
          channelNames={channels.filter((c) => selectedChannelIds.includes(c.id)).map((c) => c.name)}
          onContinue={onClose}
        />
      ) : flowStep === 'destination' ? (
        <>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] shrink-0">
            <button type="button" onClick={() => setFlowStep('select')} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
              <ArrowLeft size={18} className="text-[#0A0D14]" />
            </button>
            <h2 className="text-base font-bold text-[#0A0D14]">Listing Settings</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Fulfilling Store */}
            <div>
              <p className="text-sm font-medium text-[#0A0D14] mb-2">Fulfilling store</p>
              <div className="flex flex-wrap gap-2">
                {stores.map((s: any) => {
                  const isSel = fulfillingStoreId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFulfillingStoreId(s.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all',
                        isSel
                          ? 'bg-[#EFF5FF] border-[#0055FF] text-[#0A0D14]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                      )}
                    >
                      <Store size={14} color={BLUE} />
                      {s.name}
                    </button>
                  );
                })}
                {stores.length === 0 && <p className="text-xs text-[#94A3B8]">No stores available</p>}
              </div>
            </div>

            {/* MOQ */}
            <div>
              <p className="text-sm font-medium text-[#0A0D14] mb-2">Minimum order quantity</p>
              <input
                type="number"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm text-[#0A0D14] focus:outline-none focus:border-[#0055FF]"
              />
            </div>

            {/* Channels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#0A0D14]">Destination channels</p>
                <button
                  type="button"
                  onClick={() => setShowNewChannel((v) => !v)}
                  className="text-xs font-semibold text-[#0055FF] cursor-pointer hover:underline"
                >
                  + New channel
                </button>
              </div>
              {showNewChannel && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Channel name"
                    className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-[#F8FAFC] focus:outline-none focus:border-[#0055FF]"
                  />
                  <button
                    type="button"
                    onClick={handleCreateChannel}
                    disabled={!newChannelName.trim() || creatingChannel}
                    className="px-4 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}
              {channels.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No channels yet - create one above to publish this listing.</p>
              ) : (
                <div className="space-y-2">
                  {channels.map((c: any) => {
                    const isSel = selectedChannelIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setSelectedChannelIds((prev) =>
                            isSel ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          )
                        }
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all text-left',
                          isSel ? 'bg-[#EFF5FF] border-[#0055FF]' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                        )}
                      >
                        <Store size={16} color={BLUE} />
                        <span className="flex-1 text-sm font-medium text-[#0A0D14]">{c.name}</span>
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-[1.5px] flex items-center justify-center',
                            isSel ? 'bg-[#0055FF] border-[#0055FF]' : 'border-[#CBD5E1] bg-white'
                          )}
                        >
                          {isSel && <span className="text-white text-[10px] font-bold">v</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-5 shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!fulfillingStoreId || submitting}
              className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {submitting ? 'Listing...' : 'Confirm'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Select step */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] shrink-0">
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
              <ArrowLeft size={18} className="text-[#0A0D14]" />
            </button>
            <h2 className="text-base font-bold text-[#0A0D14]">List a Product</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
              />
            </div>

            <p className="text-sm font-semibold text-[#0A0D14]">All Products</p>

            {eligibleProducts.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-6">No marketplace-eligible products found</p>
            ) : (
              <div className="space-y-3">
                {eligibleProducts.map((prod: any) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  const existingListing = listingByProduct.get(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={cn(
                        'rounded-2xl border p-3.5 transition-all',
                        isSelected ? 'bg-white border-[#0055FF] border-[1.5px]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#EFF5FF] flex items-center justify-center shrink-0">
                            <Package size={16} color={BLUE} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0A0D14] truncate">{prod.name}</p>
                            <p className="text-xs text-[#64748B]">{prod.sku}</p>
                          </div>
                        </div>
                        {existingListing ? (
                          <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">
                            {fmt(existingListing.effectivePrice)} LIVE
                          </span>
                        ) : isSelected ? (
                          <button
                            type="button"
                            onClick={() => removeFromList(prod.id)}
                            className="text-[#64748B] hover:text-[#0A0D14] px-1 cursor-pointer shrink-0"
                          >
                            <X size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openConfigFor(prod)}
                            className="w-7 h-7 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center hover:border-[#0055FF] cursor-pointer shrink-0"
                          >
                            <Plus size={14} className="text-[#64748B]" />
                          </button>
                        )}
                      </div>

                      {isSelected && !existingListing && (
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#EFF5FF]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded bg-[#0055FF] flex items-center justify-center">
                              <span className="text-white text-[9px] font-bold">v</span>
                            </div>
                            <span className="text-xs font-medium text-[#0A0D14]">
                              {productConfigs[prod.id]?.quantity ? `${productConfigs[prod.id].quantity} units` : '-'}
                            </span>
                          </div>
                          <button type="button" onClick={() => openConfigFor(prod)} className="cursor-pointer">
                            <Edit2 size={13} color={BLUE} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-5 pb-5 shrink-0">
            <button
              type="button"
              onClick={() => setFlowStep('destination')}
              disabled={selectedProductIds.length === 0}
              className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              List {selectedProductIds.length > 0 ? selectedProductIds.length : ''} product{selectedProductIds.length !== 1 ? 's' : ''} {'->'} 
            </button>
          </div>

          {configProduct && (
            <ProductConfigPanel
              product={configProduct}
              cfgQty={cfgQty}
              cfgDesc={cfgDesc}
              cfgPriceMode={cfgPriceMode}
              cfgCustomPrice={cfgCustomPrice}
              onQty={setCfgQty}
              onDesc={setCfgDesc}
              onPriceMode={setCfgPriceMode}
              onCustomPrice={setCfgCustomPrice}
              onConfirm={confirmConfig}
              onClose={() => setConfigProduct(null)}
            />
          )}
        </>
      )}
    </SlideOver>
  );
}

// ─── Product Config Panel ──────────────────────────────────────────────────────
function ProductConfigPanel({
  product,
  cfgQty,
  cfgDesc,
  cfgPriceMode,
  cfgCustomPrice,
  onQty,
  onDesc,
  onPriceMode,
  onCustomPrice,
  onConfirm,
  onClose,
}: {
  product: any;
  cfgQty: string;
  cfgDesc: string;
  cfgPriceMode: 'custom' | 'inStore';
  cfgCustomPrice: string;
  onQty: (v: string) => void;
  onDesc: (v: string) => void;
  onPriceMode: (v: 'custom' | 'inStore') => void;
  onCustomPrice: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const canConfirm = cfgQty.trim() && (cfgPriceMode === 'inStore' || cfgCustomPrice.trim());
  return (
    <>
      <div className="absolute inset-0 bg-black/20 z-10" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-20 shadow-xl max-h-[90%] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
          <h3 className="text-base font-bold text-[#0A0D14]">List product</h3>
          <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#0A0D14] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] flex items-center justify-center">
              <Package size={20} color={BLUE} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0D14]">{product.name}</p>
              <p className="text-xs text-[#64748B]">{product.sku}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#0A0D14] mb-1.5">Listing Description</p>
            <input
              type="text"
              placeholder="Listing description"
              value={cfgDesc}
              onChange={(e) => onDesc(e.target.value)}
              className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-white focus:outline-none focus:border-[#0055FF]"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-[#0A0D14] mb-1.5">Quantity</p>
            <input
              type="number"
              placeholder="e.g. 100"
              value={cfgQty}
              onChange={(e) => onQty(e.target.value)}
              className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-white focus:outline-none focus:border-[#0055FF]"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A0D14] mb-2.5">Price Settings</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onPriceMode('custom')}
                className={cn(
                  'w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all',
                  cfgPriceMode === 'custom' ? 'bg-[#EFF5FF] border-[#0055FF] border-[1.5px]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Set custom marketplace price</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Override the standard store price</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-[1.5px] bg-white shrink-0"
                    style={{
                      borderColor: cfgPriceMode === 'custom' ? BLUE : '#CBD5E1',
                      borderWidth: cfgPriceMode === 'custom' ? 5 : 1.5,
                    }}
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => onPriceMode('inStore')}
                className={cn(
                  'w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all',
                  cfgPriceMode === 'inStore' ? 'bg-[#EFF5FF] border-[#0055FF] border-[1.5px]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Use in-store price (auto-updates)</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Sync automatically with the fulfilling store</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-[1.5px] bg-white shrink-0"
                    style={{
                      borderColor: cfgPriceMode === 'inStore' ? BLUE : '#CBD5E1',
                      borderWidth: cfgPriceMode === 'inStore' ? 5 : 1.5,
                    }}
                  />
                </div>
              </button>
              {cfgPriceMode === 'custom' && (
                <input
                  type="number"
                  placeholder="Custom price"
                  value={cfgCustomPrice}
                  onChange={(e) => onCustomPrice(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-white focus:outline-none focus:border-[#0055FF]"
                />
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 shrink-0">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            Add to list
          </button>
        </div>
      </div>
    </>
  );
}

// ─── List Product Success ─────────────────────────────────────────────────────
function ListProductSuccess({
  count,
  storeName,
  channelNames,
  onContinue,
}: {
  count: number;
  storeName?: string;
  channelNames: string[];
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
        <CheckCircle2 size={44} color={GREEN} />
      </div>
      <h2 className="text-xl font-bold text-[#0A0D14] mb-1">
        {count} Product{count === 1 ? '' : 's'} Listed!
      </h2>
      <p className="text-sm text-[#64748B] mb-8 text-center">
        Your products are now live on the marketplace.
      </p>
      <div className="w-full bg-[#F8FAFC] rounded-2xl p-4 mb-6 space-y-3">
        {[
          { label: 'Products listed', value: String(count) },
          { label: 'Fulfilling store', value: storeName ?? '-' },
          { label: 'Channels', value: channelNames.length > 0 ? channelNames.join(', ') : 'None' },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className={cn('flex justify-between py-2.5', i < arr.length - 1 ? 'border-b border-[#EAECF0]' : '')}
          >
            <span className="text-sm text-[#64748B]">{label}</span>
            <span className="text-sm font-medium text-[#0A0D14]">{value}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}

// ─── Listed Product Panel ──────────────────────────────────────────────────────
function ListedProductPanel({
  listing,
  product,
  channels,
  onClose,
  onSuccess,
}: {
  listing: any;
  product?: any;
  channels: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [quantity, setQuantity] = useState(String(listing.listedQuantity ?? ''));
  const [updatingQty, setUpdatingQty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showVintranLink, setShowVintranLink] = useState(false);
  const [vintranLink, setVintranLink] = useState('');
  const listingChannels = channels.filter((c: any) => (listing.channelIds ?? []).includes(c.id));

  const handleUpdateQuantity = async () => {
    const n = Number(quantity);
    if (!n || n === listing.listedQuantity) return;
    setUpdatingQty(true);
    try {
      await marketplaceApi.updateQuantity(listing.id, { newQuantity: n });
      toast.success('Quantity updated');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setUpdatingQty(false);
    }
  };

  const handlePause = async () => {
    setBusy(true);
    try { await marketplaceApi.pause(listing.id); toast.success('Listing paused'); onSuccess(); }
    catch (err) { toast.error(err instanceof ApiError ? err.description : 'Something went wrong'); }
    finally { setBusy(false); }
  };

  const handleResume = async () => {
    setBusy(true);
    try { await marketplaceApi.resume(listing.id); toast.success('Listing resumed'); onSuccess(); }
    catch (err) { toast.error(err instanceof ApiError ? err.description : 'Something went wrong'); }
    finally { setBusy(false); }
  };

  const handleDelist = async () => {
    if (!confirm('Remove this listing from the marketplace?')) return;
    setBusy(true);
    try { await marketplaceApi.delete(listing.id); toast.success('Listing removed'); onSuccess(); }
    catch (err) { toast.error(err instanceof ApiError ? err.description : 'Something went wrong'); }
    finally { setBusy(false); }
  };

  const handleAttachLink = async () => {
    if (!vintranLink.trim()) return;
    try {
      await marketplaceApi.attachVintranLink(listing.id, { link: vintranLink.trim() });
      toast.success('Vintran Link attached');
      setShowVintranLink(false);
      setVintranLink('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    }
  };

  return (
    <SlideOver open onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
        <h2 className="text-base font-bold text-[#0A0D14]">Listed product</h2>
        <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#0A0D14] cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
          <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] flex items-center justify-center">
            <Package size={20} color={BLUE} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A0D14]">{product?.name ?? listing.referenceCode}</p>
            <p className="text-xs text-[#64748B]">{product?.sku ?? listing.referenceCode}</p>
          </div>
        </div>

        {listing.description && (
          <div>
            <p className="text-xs font-medium text-[#0A0D14] mb-1">Description</p>
            <p className="text-sm text-[#64748B]">{listing.description}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-[#0A0D14] mb-1.5">Quantity</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 h-11 px-3.5 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm text-[#0A0D14] focus:outline-none focus:border-[#0055FF]"
            />
            <button
              type="button"
              onClick={handleUpdateQuantity}
              disabled={Number(quantity) === listing.listedQuantity || !quantity || updatingQty}
              className="px-4 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {updatingQty ? '...' : 'Update'}
            </button>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Minimum order quantity: {listing.minimumOrderQuantity}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0A0D14] mb-2">Pricing</p>
          <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3.5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-[#64748B]">Effective price</span>
              <span className="text-sm font-bold text-[#0A0D14]">{fmt(listing.effectivePrice)}</span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {listing.tracksStorePrice
                ? 'Tracks the in-store price automatically'
                : 'Custom marketplace price (does not change with in-store price)'}
            </p>
          </div>
        </div>

        {listingChannels.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#0A0D14] mb-2">Published to</p>
            <div className="flex flex-wrap gap-2">
              {listingChannels.map((c: any) => (
                <span key={c.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EFF5FF] text-[#0055FF]">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowVintranLink(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#0055FF] cursor-pointer hover:underline"
        >
          <Link2 size={14} />
          Attach Vintran Link
        </button>

        {showVintranLink && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2 bg-[#EFF5FF] rounded-xl p-3">
              <AlertCircle size={14} color={BLUE} className="mt-0.5 shrink-0" />
              <p className="text-xs text-[#0055FF] leading-relaxed">
                Enter the Vintran Link contract reference for this listing. Buyers can choose to apply it at checkout.
              </p>
            </div>
            <input
              type="text"
              value={vintranLink}
              onChange={(e) => setVintranLink(e.target.value)}
              placeholder="Vintran Link reference"
              className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] bg-white focus:outline-none focus:border-[#0055FF]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowVintranLink(false); setVintranLink(''); }}
                className="flex-1 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAttachLink}
                disabled={!vintranLink.trim()}
                className="flex-1 h-10 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                Attach
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 space-y-2 shrink-0">
        <button
          type="button"
          onClick={listing.status === 'Active' ? handlePause : handleResume}
          disabled={busy}
          className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {listing.status === 'Active' ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={handleDelist}
          disabled={busy}
          className="w-full h-12 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-red-100 transition-colors"
        >
          De-list Product
        </button>
      </div>
    </SlideOver>
  );
}

// ─── Sale Detail Panel ────────────────────────────────────────────────────────
function SaleDetailPanel({
  saleId,
  stores,
  onClose,
  onSuccess,
}: {
  saleId: string;
  stores: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAttributePanel, setShowAttributePanel] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [attributionSuccess, setAttributionSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    salesApi.get(saleId)
      .then((res: any) => setSale(normalizeSale(res.data ?? res)))
      .catch(() => toast.error('Failed to load sale'))
      .finally(() => setLoading(false));
  }, [saleId]);

  const handleAttribute = async () => {
    if (!selectedLocationId || !sale) return;
    setAssigning(true);
    try {
      await salesApi.assignLocation(sale.id, selectedLocationId);
      setShowAttributePanel(false);
      setAttributionSuccess(true);
      onSuccess();
      const res: any = await salesApi.get(saleId);
      setSale(normalizeSale(res.data ?? res));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!sale) return;
    setDispatching(true);
    try {
      await salesApi.confirmDispatch(sale.id);
      toast.success('Dispatch confirmed');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setDispatching(false);
    }
  };

  if (attributionSuccess && sale) {
    const storeName = stores.find((s) => s.id === sale.locationId)?.name;
    return (
      <SlideOver open onClose={() => { setAttributionSuccess(false); onClose(); }}>
        <AttributionSuccess
          sale={sale}
          storeName={storeName}
          onContinue={() => { setAttributionSuccess(false); onClose(); }}
        />
      </SlideOver>
    );
  }

  return (
    <SlideOver open onClose={onClose}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] shrink-0">
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
          <ArrowLeft size={18} className="text-[#0A0D14]" />
        </button>
        <h2 className="text-base font-bold text-[#0A0D14]">Marketplace Sale</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !sale ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[#94A3B8]">Sale not found</div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF5FF] flex items-center justify-center">
                <Package size={20} color={BLUE} />
              </div>
              <div>
                <p className="text-base font-bold text-[#0A0D14]">{sale.number}</p>
                <p className="text-xs text-[#64748B]">
                  {(sale.lines?.length ?? 0)} item{sale.lines?.length === 1 ? '' : 's'} &middot; {sale.customerName ?? 'Walk-in customer'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0A0D14] mb-3">Order Details</p>
              <div className="divide-y divide-[#F1F5F9]">
                {[
                  {
                    label: 'Date',
                    value: sale.createdOnUtc
                      ? new Date(sale.createdOnUtc).toLocaleString(undefined, {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : '-',
                  },
                  { label: 'Total Item Count', value: `${(sale.lines ?? []).reduce((s: number, l: any) => s + l.quantity, 0)} units` },
                  { label: 'Amount', value: fmt(sale.grandTotal), color: BLUE },
                  { label: 'Payment Method', value: sale.paymentMethod ?? sale.paymentKind ?? '-' },
                  { label: 'Outstanding', value: fmt(sale.outstandingBalance), color: (sale.outstandingBalance ?? 0) > 0 ? '#DC2626' : GREEN },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between py-3">
                    <span className="text-sm text-[#64748B]">{label}</span>
                    <span className="text-sm font-medium" style={{ color: color ?? '#0A0D14' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center py-4">
              <span className="text-sm font-medium" style={{ color: sale.isLocationAssigned ? GREEN : AMBER }}>
                {sale.isLocationAssigned ? 'Store location attributed' : 'Pending store location attribution'}
              </span>
            </div>
          </div>

          <div className="px-5 pb-5 shrink-0">
            {!sale.isLocationAssigned ? (
              <button
                type="button"
                onClick={() => setShowAttributePanel(true)}
                className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Attribute Store Location
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={dispatching}
                className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {dispatching ? 'Confirming...' : 'Confirm Dispatch'}
              </button>
            )}
          </div>

          {showAttributePanel && (
            <>
              <div className="absolute inset-0 bg-black/20 z-10" onClick={() => setShowAttributePanel(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-20 shadow-xl max-h-[75%] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
                  <h3 className="text-base font-bold text-[#0A0D14]">Select Store Location</h3>
                  <button type="button" onClick={() => setShowAttributePanel(false)} className="text-[#94A3B8] hover:text-[#0A0D14] cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  <div className="flex items-start gap-2 bg-[#EFF5FF] rounded-xl p-3">
                    <AlertCircle size={14} color={BLUE} className="mt-0.5 shrink-0" />
                    <p className="text-xs text-[#0055FF] leading-relaxed">
                      Select the store location this order should be dispatched from
                    </p>
                  </div>
                  {stores.map((st: any) => {
                    const isSel = selectedLocationId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedLocationId(st.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all text-left',
                          isSel ? 'bg-[#EFF5FF] border-[#0055FF] border-[1.5px]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                        )}
                      >
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                          <Store size={18} color={BLUE} />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-[#0A0D14]">{st.name}</span>
                        <div
                          className="w-5 h-5 rounded-full border-[1.5px] bg-white shrink-0"
                          style={{ borderColor: isSel ? BLUE : '#CBD5E1', borderWidth: isSel ? 6 : 1.5 }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="px-5 pb-5 shrink-0">
                  <button
                    type="button"
                    onClick={handleAttribute}
                    disabled={!selectedLocationId || assigning}
                    className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
                  >
                    {assigning ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </SlideOver>
  );
}

// ─── Attribution Success ───────────────────────────────────────────────────────
function AttributionSuccess({
  sale,
  storeName,
  onContinue,
}: {
  sale: any;
  storeName?: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
        <CheckCircle2 size={44} color={GREEN} />
      </div>
      <h2 className="text-xl font-bold text-[#0A0D14] mb-1">Attribution Successful!</h2>
      <p className="text-sm text-[#64748B] mb-8 text-center">
        The order has been attributed to a store location.
      </p>
      <div className="w-full bg-[#F8FAFC] rounded-2xl p-4 mb-6 space-y-3">
        {[
          { label: 'Order', value: sale.number },
          { label: 'Item Count', value: `${(sale.lines ?? []).reduce((s: number, l: any) => s + l.quantity, 0)} units` },
          { label: 'Amount', value: fmt(sale.grandTotal) },
          { label: 'Store Attributed', value: storeName ?? '-', color: BLUE },
        ].map(({ label, value, color }, i, arr) => (
          <div
            key={label}
            className={cn('flex justify-between py-2.5', i < arr.length - 1 ? 'border-b border-[#EAECF0]' : '')}
          >
            <span className="text-sm text-[#64748B]">{label}</span>
            <span className="text-sm font-medium" style={{ color: color ?? '#0A0D14' }}>{value}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
