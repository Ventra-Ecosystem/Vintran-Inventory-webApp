// src/features/warehouse/OverviewTab.tsx
'use client';

import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  MapPin,
  SlidersHorizontal,
  History,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import {
  ArrowRightIcon,
  PakageIcon,
  SwitchIcon,
  WareHouseIcon,
} from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { locationsApi } from '@/src/lib/api/catalog';
import { useEffect } from 'react';

type WarehouseTab =
  | 'overview'
  | 'receive'
  | 'transfer'
  | 'locations'
  | 'adjust'
  | 'history';

interface OverviewTabProps {
  onNavigate: (tab: WarehouseTab) => void;
}

interface LocationItem {
  id: string;
  name: string;
  kind: string;
  phoneNumbers: string[];
  isActive: boolean;
}

const shortcuts: {
  tab: WarehouseTab;
  label: string;
  icon: typeof ArrowDownToLine;
}[] = [
    { tab: 'receive', label: 'Receive', icon: ArrowDownToLine },
    { tab: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { tab: 'locations', label: 'Locations', icon: MapPin },
    { tab: 'adjust', label: 'Adjust', icon: SlidersHorizontal },
    { tab: 'history', label: 'History', icon: History },
  ];

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [activeLocation, setActiveLocation] = useState<LocationItem | null>(null);
  const [pendingLocation, setPendingLocation] = useState<LocationItem | null>(null);

  useEffect(() => {
    locationsApi.list().then((res: any) => {
      const locs: LocationItem[] = res.data ?? [];
      setLocations(locs);
      if (locs.length > 0) {
        setActiveLocation(locs[0]);
        setPendingLocation(locs[0]);
      }
    }).catch(() => {/* handled gracefully */});
  }, []);

  const handleOpen = () => {
    setPendingLocation(activeLocation);
    setIsSwitcherOpen(true);
  };

  const handleConfirm = () => {
    setActiveLocation(pendingLocation);
    setIsSwitcherOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Viewing Warehouse banner */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 bg-brand-lighter text-brand-dark"
      >
        <div className="flex items-center gap-3">
          <div>
            <WareHouseIcon />
          </div>
          <div className="text-left">
            <p className="text-xs font-normal text-brand-dark">
              Viewing Warehouse
            </p>
            <span className="text-sm font-semibold text-brand-dark">
              {activeLocation?.name ?? 'Select a location'}
            </span>
            <p className="text-xs font-medium text-brand-dark">
              {activeLocation?.kind ?? '—'}
            </p>
          </div>
        </div>
        <div>
          <SwitchIcon width={20} />
        </div>
      </button>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard01 label="Locations" value={String(locations.length)} icon={<PakageIcon width={24} />} />
        <StatCard01 label="Active" value={String(locations.filter(l => l.isActive).length)} icon={<PakageIcon width={24} />} />
        <StatCard01 label="Stores" value={String(locations.filter(l => l.kind === 'Store').length)} icon={<PakageIcon width={24} />} />
        <StatCard01 label="Warehouses" value={String(locations.filter(l => l.kind === 'Warehouse').length)} icon={<PakageIcon width={24} />} />
      </div>

      {/* Actions */}
      <div>
        <p className="pb-3 text-text-subtle text-sm font-medium">Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map(({ tab, label, icon: Icon }) => (
            <button key={tab} type="button" onClick={() => onNavigate(tab)}>
              <StatCard01
                value={label}
                label="Description"
                icon={<Icon size={20} />}
                textSize="text-sm"
                textSize2="text-xs"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Active Locations */}
      <div>
        <p className="pb-3 text-text-subtle text-sm font-medium">Active Locations</p>
        <div className="bg-bg-surface px-4 py-3 rounded-[8px] space-y-3">
          {locations.filter(l => l.isActive).map((loc, idx, arr) => (
            <div key={loc.id}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-lighter w-10 h-10 flex justify-center items-center rounded-full text-brand">
                    <WareHouseIcon />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-xs text-text-default">{loc.name}</p>
                    <p className="text-text-muted font-medium text-[10px]">{loc.kind}</p>
                  </div>
                </div>
                <ArrowRightIcon width={20} />
              </div>
              {idx < arr.length - 1 && <div className="bg-[#9B9EA34D] h-[1px] w-full mt-3" />}
            </div>
          ))}
          {locations.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">No locations yet</p>
          )}
        </div>
      </div>

      {/* Switch Warehouse Modal */}
      <Modal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-text-default leading-snug">
            Switch Warehouse
          </h2>
          <button type="button" className="text-text-muted hover:text-text-subtle mt-0.5">
            <HelpCircle size={18} />
          </button>
        </div>
        <p className="text-xs text-text-muted mb-5 leading-relaxed">
          Select a warehouse or store-warehouse to set as your active view.
        </p>

        <div className="space-y-2">
          {locations.map((loc) => {
            const isSelected = pendingLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setPendingLocation(loc)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-brand bg-brand-lighter'
                    : 'border-gray-200 bg-white hover:bg-bg-surface'
                )}
              >
                <div className={cn(
                  'w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg',
                  isSelected ? 'bg-white text-brand' : 'bg-bg-surface text-text-muted'
                )}>
                  <WareHouseIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-text-default truncate block">{loc.name}</span>
                  <p className="text-[11px] text-text-muted mt-0.5">{loc.kind}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-brand' : 'border-gray-300'
                )}>
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
