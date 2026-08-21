'use client';

import { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  MapPin,
  SlidersHorizontal,
  History,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { ArrowRightIcon, PakageIcon, SwitchIcon, WareHouseIcon, StoreIcon } from '@/src/assets/icon';
import { Button } from '@/src/components/ui/Button';
import { cn, toArr } from '@/src/lib/utils';
import { locationsApi, reportsApi, stockApi } from '@/src/lib/api/catalog';

type WarehouseTab = 'overview' | 'receive' | 'transfer' | 'locations' | 'adjust' | 'history';

interface OverviewTabProps {
  onNavigate: (tab: WarehouseTab) => void;
}

interface LocationItem {
  id: string;
  name: string;
  kind: string;
  isActive: boolean;
}

const shortcuts: { tab: WarehouseTab; label: string; sub: string; icon: typeof ArrowDownToLine }[] = [
  { tab: 'receive', label: 'Receive Stock', sub: 'Log incoming goods', icon: ArrowDownToLine },
  { tab: 'transfer', label: 'Transfer Stock', sub: 'Move stock to stores', icon: ArrowLeftRight },
  { tab: 'locations', label: 'Manage Locations', sub: 'Stores & warehouses', icon: MapPin },
  { tab: 'adjust', label: 'Adjustment', sub: 'Correct quantities', icon: SlidersHorizontal },
  { tab: 'history', label: 'Stock History', sub: 'View all movements', icon: History },
];

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [activeLocation, setActiveLocation] = useState<LocationItem | null>(null);
  const [pendingLocation, setPendingLocation] = useState<LocationItem | null>(null);
  const [report, setReport] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    locationsApi.list()
      .then((res: any) => {
        const locs: LocationItem[] = toArr(res.data);
        setLocations(locs);
        if (locs.length > 0) {
          setActiveLocation(locs[0]);
          setPendingLocation(locs[0]);
        }
      })
      .catch(() => {});

    reportsApi.inventory()
      .then((res: any) => setReport(res.data ?? null))
      .catch(() => {});

    stockApi.getPendingTransfers()
      .then((res: any) => setPendingCount(toArr(res.data).length))
      .catch(() => {});
  }, []);

  const handleOpen = () => { setPendingLocation(activeLocation); setIsSwitcherOpen(true); };
  const handleConfirm = () => { setActiveLocation(pendingLocation); setIsSwitcherOpen(false); };

  const locationsCount = locations.length;
  const totalSkus = report?.totalProductCount ?? report?.productCount ?? '—';
  const stockValue = report?.estimatedStockValueAtCost
    ? `₦${Number(report.estimatedStockValueAtCost).toLocaleString()}`
    : '—';

  return (
    <div className="space-y-6">
      {/* Active warehouse banner */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 bg-brand-lighter"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <WareHouseIcon />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-brand">Viewing Warehouse</p>
            <p className="text-sm font-bold text-[#0A0D14]">{activeLocation?.name ?? 'No Warehouse'}</p>
            <p className="text-xs font-medium text-brand">
              {activeLocation ? `${activeLocation.kind} · Primary` : 'No locations yet'}
            </p>
          </div>
        </div>
        <SwitchIcon width={20} />
      </button>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <StoreIcon width={22} className="text-emerald-600" />, value: String(locationsCount), label: 'Locations', bg: 'bg-emerald-50' },
          { icon: <PakageIcon width={22} className="text-brand" />, value: String(totalSkus), label: 'Total SKUs', bg: 'bg-brand-lighter' },
          { icon: <PakageIcon width={22} className="text-text-muted" />, value: stockValue, label: 'Stock Value', bg: 'bg-bg-surface' },
          {
            icon: <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">!</span>,
            value: String(pendingCount),
            label: 'Pending Transfers',
            bg: 'bg-amber-50',
          },
        ].map(({ icon, value, label, bg }) => (
          <div key={label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center mb-3', bg)}>
              {icon}
            </div>
            <p className="text-xl font-bold text-[#0A0D14] mb-1">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div>
        <p className="text-sm font-medium text-text-default mb-3">Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map(({ tab, label, sub, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onNavigate(tab)}
              className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 text-left hover:border-brand/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand-lighter flex items-center justify-center mb-3">
                <Icon size={18} className="text-brand" />
              </div>
              <p className="text-sm font-bold text-[#0A0D14] mb-0.5">{label}</p>
              <p className="text-xs text-text-muted">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Locations */}
      <div>
        <p className="text-sm font-medium text-text-default mb-3">Active Locations</p>
        <div className="bg-bg-surface rounded-2xl overflow-hidden">
          {locations.filter(l => l.isActive).length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No active locations</p>
          ) : locations.filter(l => l.isActive).map((loc, idx, arr) => (
            <div
              key={loc.id}
              className={cn('flex items-center justify-between px-4 py-3.5', idx < arr.length - 1 && 'border-b border-[#E2E8F0]')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-lighter flex items-center justify-center">
                  <WareHouseIcon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#0A0D14]">{loc.name}</p>
                    {idx === 0 && (
                      <span className="bg-[#DBEAFE] px-2 py-0.5 rounded-full text-[10px] font-medium text-brand">Primary</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{loc.kind}</p>
                </div>
              </div>
              <ArrowRightIcon width={16} className="text-text-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Switch Warehouse Modal */}
      <Modal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-text-default">Switch Warehouse</h2>
          <button type="button" className="text-text-muted hover:text-text-subtle">
            <HelpCircle size={18} />
          </button>
        </div>
        <p className="text-xs text-text-muted mb-5 leading-relaxed">
          Select a warehouse or store-warehouse to set as your active view.
        </p>
        <div className="space-y-2">
          {locations.map((loc, idx) => {
            const isSelected = pendingLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setPendingLocation(loc)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  isSelected ? 'border-brand bg-brand-lighter' : 'border-gray-200 bg-white hover:bg-bg-surface'
                )}
              >
                <div className={cn('w-9 h-9 shrink-0 flex items-center justify-center rounded-lg', isSelected ? 'bg-white text-brand' : 'bg-bg-surface text-text-muted')}>
                  <WareHouseIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-default truncate">{loc.name}</span>
                    {idx === 0 && (
                      <span className="bg-[#DBEAFE] px-2 py-0.5 rounded-full text-[10px] font-medium text-brand shrink-0">Primary</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{loc.kind}</p>
                </div>
                <div className={cn('w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center', isSelected ? 'border-brand' : 'border-gray-300')}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" fullWidth size="lg" type="button" onClick={() => setIsSwitcherOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth size="lg" type="button" onClick={handleConfirm}>
            View warehouse
          </Button>
        </div>
      </Modal>
    </div>
  );
}
