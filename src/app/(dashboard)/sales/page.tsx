'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { DashSquareIcon, PakageIcon, StoreIcon, MoneyIcon } from '@/src/assets/icon';
import { salesApi } from '@/src/lib/api/commerce';
import { reportsApi, locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { useUIStore } from '@/src/store/uiStore';

// ── Sub-tab feature components ─────────────────────────────────────────────
import { RecordSaleFlow } from '@/src/features/sales/RecordSaleFlow';
import { ReceiveTab } from '@/src/features/sales/ReceiveTab';
import { AdjustTab } from '@/src/features/warehouse/AdjustTab';
import { ReturnsSpoilageTab } from '@/src/features/sales/ReturnsSpoilageTab';

type SalesTab = 'Sales' | 'Receive' | 'Adjust' | 'Returns & Spoilage';

const TABS: SalesTab[] = ['Sales', 'Receive', 'Adjust', 'Returns & Spoilage'];

function fmt(n?: number | null) {
  if (n == null) return '—';
  return `₦${n.toLocaleString()}`;
}

// ── Store Filter Panel (slides from right) ─────────────────────────────────

function StorePanel({
  open,
  onClose,
  locations,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  locations: any[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white shadow-xl rounded-l-3xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 pb-8 flex-1 overflow-y-auto">
          <p className="text-base font-bold text-[#0A0D14] pt-3 mb-4">Viewing</p>

          {/* All stores */}
          <button
            type="button"
            onClick={() => { onSelect('all'); onClose(); }}
            className="w-full flex items-center gap-3 py-3.5 border-b border-[#F1F5F9]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0">
              <StoreIcon width={18} className="text-[#64748B]" />
            </div>
            <span className={cn('flex-1 text-sm text-left', selected === 'all' ? 'font-bold text-brand' : 'font-medium text-[#0A0D14]')}>
              All stores{locations.length > 0 ? ` (${locations.length})` : ''}
            </span>
            <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', selected === 'all' ? 'border-brand' : 'border-[#CBD5E1]')}>
              {selected === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
            </div>
          </button>

          {locations.map(loc => {
            const isSel = selected === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => { onSelect(loc.id); onClose(); }}
                className="w-full flex items-center gap-3 py-3.5 border-b border-[#F1F5F9] last:border-0"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0">
                  <StoreIcon width={18} className={isSel ? 'text-brand' : 'text-[#64748B]'} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn('text-sm', isSel ? 'font-bold text-brand' : 'font-medium text-[#0A0D14]')}>{loc.name}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{loc.kind}</p>
                </div>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', isSel ? 'border-brand' : 'border-[#CBD5E1]')}>
                  {isSel && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Sale Row ─────────────────────────────────────────────────────────────────

function SaleRow({ sale, onPress }: { sale: any; onPress?: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0 text-left hover:bg-[#F8FAFC] transition-colors -mx-1 px-1 rounded-lg"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#0A0D14]">
          {sale.number} · {sale.customerName ?? 'Walk-in'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-[#64748B]">
            {new Date(sale.createdOnUtc).toLocaleString()}
          </p>
          {!sale.isLocationAssigned && (
            <span className="text-xs font-medium text-[#EA580C]">· Pending attribution</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 pl-3">
        <p className="text-[13px] font-semibold text-[#0A0D14]">{fmt(sale.grandTotal)}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <StoreIcon width={11} className="text-[#64748B]" />
          <p className="text-[11px] font-medium text-[#64748B]">{sale.channel}</p>
        </div>
      </div>
    </button>
  );
}

// ── Sales tab content (main dashboard) ───────────────────────────────────────

function SalesTabContent({
  onRecord,
  locations,
  selectedStore,
  onOpenStoreSheet,
}: {
  onRecord: () => void;
  locations: any[];
  selectedStore: string;
  onOpenStoreSheet: () => void;
}) {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      salesApi.getReport(today, today),
      reportsApi.inventory(),
      salesApi.list({ pageSize: 5 }),
    ])
      .then(([saleRes, invRes, recentRes]: any[]) => {
        setSalesReport(saleRes.data ?? null);
        setInventoryReport(invRes.data ?? null);
        const raw = recentRes.data?.items ?? recentRes.data ?? [];
        const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
        const normalize = (s: any) => ({
          ...s,
          isLocationAssigned: s.isLocationAssigned ?? (!!s.locationId && s.locationId !== EMPTY_GUID),
          createdOnUtc: s.createdOnUtc ?? s.occurredOnUtc ?? '',
        });
        setRecentSales((Array.isArray(raw) ? raw : []).map(normalize));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load sales data');
        }
      })
      .finally(() => setLoading(false));
  }, [selectedStore, today]);

  const selectedStoreName =
    selectedStore === 'all'
      ? `All stores${locations.length > 0 ? ` (${locations.length})` : ''}`
      : locations.find(l => l.id === selectedStore)?.name ?? 'All stores';

  const stats = [
    {
      label: "Today's Sales",
      value: loading ? '…' : fmt(salesReport?.totalRevenue ?? salesReport?.totalSales),
      color: '#0055FF',
      bg: '#EFF5FF',
    },
    {
      label: 'Stock Value',
      value: loading ? '…' : fmt(inventoryReport?.estimatedStockValueAtCost),
      color: '#16A34A',
      bg: '#DCFCE7',
    },
    {
      label: `${loading ? '…' : (inventoryReport?.lowStockProductCount ?? 0)} Items\nLow Stock`,
      value: null,
      color: '#EA580C',
      bg: '#FFF7ED',
    },
    {
      label: 'Returns & Spoilages',
      value: '--',
      color: '#64748B',
      bg: '#F1F5F9',
      dashed: true,
    },
  ];

  return (
    <div className="space-y-5 pb-20">
      {/* Store filter pill */}
      <button
        type="button"
        onClick={onOpenStoreSheet}
        className="w-full flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-3.5 py-3"
      >
        <StoreIcon width={16} className="text-[#64748B] shrink-0" />
        <span className="flex-1 text-[13px] font-medium text-[#0A0D14] text-left">{selectedStoreName}</span>
        <ChevronDown size={16} className="text-[#64748B]" />
      </button>

      {/* 2×2 stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              'bg-white rounded-[14px] p-4 border',
              stat.dashed ? 'border-dashed border-[#CBD5E1]' : 'border-[#F1F5F9]'
            )}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
              style={{ backgroundColor: stat.bg }}
            >
              <PakageIcon width={18} style={{ color: stat.color }} />
            </div>
            {stat.value !== null && (
              <p className="text-xl font-bold text-[#0A0D14]">{stat.value}</p>
            )}
            <p className="text-xs text-[#64748B] leading-relaxed mt-0.5 whitespace-pre-line">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Record a sale button */}
      <button
        type="button"
        onClick={onRecord}
        className="w-full h-12 rounded-[10px] bg-[#EFF5FF] border-[1.5px] border-[#DBEAFE] flex items-center justify-center gap-2"
      >
        <Plus size={18} color="#0055FF" />
        <span className="text-sm font-semibold text-[#0055FF]">Record a sale</span>
      </button>

      {/* Recent sales */}
      <div>
        <p className="text-[15px] font-semibold text-[#0A0D14] mb-3">Recent sales</p>
        {recentSales.length === 0 ? (
          <p className="text-[13px] text-[#94A3B8] text-center py-6">No sales recorded yet</p>
        ) : (
          <div className="bg-white">
            {recentSales.map(sale => <SaleRow key={sale.id} sale={sale} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Sales Page ──────────────────────────────────────────────────────────

export default function SalesPage() {
  const toggleDrawer = useUIStore(s => s.toggleDrawer);
  const [tab, setTab] = useState<SalesTab>('Sales');
  const [recording, setRecording] = useState(false);
  const [storeSheetOpen, setStoreSheetOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState('all');
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    locationsApi.list()
      .then((res: any) => setLocations(toArr(res.data)))
      .catch(() => {});
  }, []);

  // When recording, show full-screen record flow
  if (recording) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setRecording(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-[#0A0D14]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#0A0D14]">Record a sale</h1>
        </div>
        <RecordSaleFlow />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[22px] font-bold text-[#0A0D14]">Store & Sales</h1>
        <div className="flex items-center gap-2.5">
          {/* Record sale FAB */}
          <button
            type="button"
            onClick={() => setRecording(true)}
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
          >
            <Plus size={20} color="#fff" />
          </button>
          <button
            type="button"
            onClick={toggleDrawer}
            className="w-10 h-10 rounded-full bg-[#EFF5FF] flex items-center justify-center"
          >
            <DashSquareIcon width={20} className="text-brand" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#E2E8F0] mb-4">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'font-bold text-[#0A0D14] border-brand'
                  : 'font-medium text-[#64748B] border-transparent'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'Sales' && (
        <SalesTabContent
          onRecord={() => setRecording(true)}
          locations={locations}
          selectedStore={selectedStore}
          onOpenStoreSheet={() => setStoreSheetOpen(true)}
        />
      )}
      {tab === 'Receive' && <ReceiveTab />}
      {tab === 'Adjust' && <AdjustTab />}
      {tab === 'Returns & Spoilage' && <ReturnsSpoilageTab />}

      {/* Store selector panel */}
      <StorePanel
        open={storeSheetOpen}
        onClose={() => setStoreSheetOpen(false)}
        locations={locations}
        selected={selectedStore}
        onSelect={setSelectedStore}
      />
    </main>
  );
}
