'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowleftdownIcon,
  ArrowRightIcon,
  MoneyIcon,
  PakageIcon,
  StoreIcon,
  WareHouseIcon,
} from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { dashboardApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn, toArr } from '@/src/lib/utils';

function fmt(n: number | null | undefined) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  );
}

const ACTIONS = [
  { icon: <WareHouseIcon width={20} />, label: 'Warehouse Set up', sub: 'Set your warehouse', href: '/warehouse-management' },
  { icon: <PakageIcon width={20} />, label: 'Add product', sub: 'Add your first product', href: '/product' },
  { icon: <MoneyIcon width={20} />, label: 'Record Sales', sub: 'Record a sale', href: '/sales' },
];

// ── Store Picker — slides from right like mobile BottomSheet ──────────────

function StorePicker({
  stores,
  selected,
  onSelect,
}: {
  stores: { id: string; name: string; kind?: string }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = selected ? (stores.find(s => s.id === selected)?.name ?? 'All stores') : `All stores${stores.length > 0 ? ` (${stores.length})` : ''}`;

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-3.5 py-3"
      >
        <StoreIcon width={16} className="text-[#64748B] shrink-0" />
        <span className="flex-1 text-[13px] font-medium text-[#0A0D14] text-left">{label}</span>
        <ChevronDown size={16} className="text-[#64748B]" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Slide-from-right panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col rounded-l-3xl overflow-hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Handle bar at top of panel */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-6 flex-1 overflow-y-auto">
          <p className="text-base font-bold text-[#0A0D14] mb-4 pt-3">Viewing</p>

          {/* All stores row */}
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); }}
            className="w-full flex items-center gap-3 py-3.5 border-b border-[#F1F5F9]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0">
              <StoreIcon width={18} className="text-[#64748B]" />
            </div>
            <span className={cn('flex-1 text-sm text-left', selected === null ? 'font-bold text-brand' : 'font-medium text-[#0A0D14]')}>
              All stores{stores.length > 0 ? ` (${stores.length})` : ''}
            </span>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              selected === null ? 'border-brand' : 'border-[#CBD5E1]'
            )}>
              {selected === null && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
            </div>
          </button>

          {/* Individual stores */}
          {stores.map(s => {
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onSelect(s.id); setOpen(false); }}
                className="w-full flex items-center gap-3 py-3.5 border-b border-[#F1F5F9] last:border-0"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0">
                  <StoreIcon width={18} className={isSel ? 'text-brand' : 'text-[#64748B]'} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn('text-sm', isSel ? 'font-bold text-brand' : 'font-medium text-[#0A0D14]')}>{s.name}</p>
                  {s.kind && <p className="text-[11px] text-[#94A3B8] mt-0.5">{s.kind}</p>}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                  isSel ? 'border-brand' : 'border-[#CBD5E1]'
                )}>
                  {isSel && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Activity Row ──────────────────────────────────────────────────────────

function ActivityRow({ title, subtitle, amount, last }: { title: string; subtitle: string; amount?: string; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-3.5', !last && 'border-b border-[#F1F5F9]')}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#EFF5FF] flex items-center justify-center shrink-0">
          <ArrowleftdownIcon width={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0A0D14] truncate">{title}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
        </div>
      </div>
      {amount && <p className="text-sm font-bold text-[#0A0D14] shrink-0 pl-3">{amount}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<{ id: string; name: string; kind?: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Load locations for store picker
  useEffect(() => {
    locationsApi.list()
      .then((res: any) => {
        const locs = toArr(res.data);
        setLocations(locs.filter((l: any) => l.kind === 'Store' || l.kind === 'Both').map((l: any) => ({ id: l.id, name: l.name, kind: l.kind })));
      })
      .catch(() => {});
  }, []);

  // Reload summary when store changes
  useEffect(() => {
    setLoading(true);
    dashboardApi.getSummary({ from: today, to: today }, selectedStoreId ?? undefined)
      .then((res: any) => setSummary(res.data ?? null))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status !== 403) toast.error(err.description);
      })
      .finally(() => setLoading(false));
  }, [selectedStoreId]);

  const stats = [
    {
      icon: <MoneyIcon width={20} />,
      value: loading ? '…' : fmt(summary?.totalSales),
      label: "Today's Sales",
      iconBg: 'bg-[#EFF5FF]',
    },
    {
      icon: <PakageIcon width={20} className="text-emerald-600" />,
      value: loading ? '…' : fmt(summary?.stockValue),
      label: 'Stock Value',
      iconBg: 'bg-emerald-50',
    },
    {
      icon: <AlertCircle size={16} className="text-amber-500" />,
      value: loading ? '…' : `${summary?.lowStockCount ?? 0} Items`,
      label: 'Low Stock',
      iconBg: 'bg-amber-50',
    },
  ];

  const activity: any[] = summary?.recentActivity ?? [];

  return (
    <div className="w-full">
      {/* ── Segmented pill tabs ── */}
      <div className="flex justify-center mb-5">
        <div className="flex bg-[#F8FAFC] rounded-full p-1 gap-0">
          <span className="px-5 py-2 rounded-full bg-brand text-white text-sm font-bold">Dashboard</span>
          <Link
            href="/dashboard/overview"
            className="px-5 py-2 rounded-full text-sm font-bold text-[#64748B] hover:text-[#0A0D14] transition-colors"
          >
            Business Overview
          </Link>
        </div>
      </div>

      {/* ── Store selector ── */}
      <StorePicker stores={locations} selected={selectedStoreId} onSelect={setSelectedStoreId} />

      {/* ── 3 stat cards in one row ── */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {stats.map(({ icon, value, label, iconBg }) => (
          <div key={label} className="bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mb-2.5', iconBg)}>
              {icon}
            </div>
            <p className="text-sm font-bold text-[#0A0D14] truncate">{value}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <p className="text-base font-bold text-[#0A0D14] mb-3.5">Actions</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ACTIONS.map(({ icon, label, sub, href }) => (
          <Link key={label} href={href}>
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 hover:border-brand/20 transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#EFF5FF] flex items-center justify-center mb-3.5">
                {icon}
              </div>
              <p className="text-sm font-bold text-[#0A0D14]">{label}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold text-[#0A0D14]">Recent activity</p>
        <Link href="/sales" className="text-sm font-medium text-brand">View all</Link>
      </div>

      <div className="bg-[#F8FAFC] rounded-2xl px-4 border border-gray-100">
        {loading ? (
          <p className="text-text-muted text-sm text-center py-6">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">No recent activity</p>
        ) : (
          activity.slice(0, 5).map((item: any, i: number, arr) => (
            <ActivityRow
              key={item.id ?? i}
              title={item.summary ?? item.action ?? 'Activity'}
              subtitle={item.occurredOnUtc ? fmtDate(item.occurredOnUtc) : ''}
              amount={item.amount != null ? fmt(item.amount) : (item.detail || undefined)}
              last={i === arr.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
