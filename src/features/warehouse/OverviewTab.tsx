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

// TODO: replace with real API call
const warehouses = [
  { id: '1', name: 'Main Warehouse', type: 'Physical', skus: 180, isPrimary: true },
  { id: '2', name: 'Store A · Victoria Island', type: 'Store-Warehouse', skus: 67, isPrimary: false },
];

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
  const [activeWarehouse, setActiveWarehouse] = useState(warehouses[0]);
  const [pendingWarehouse, setPendingWarehouse] = useState(warehouses[0]);

  const handleOpen = () => {
    setPendingWarehouse(activeWarehouse);
    setIsSwitcherOpen(true);
  };

  const handleConfirm = () => {
    setActiveWarehouse(pendingWarehouse);
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
              {activeWarehouse.name}
            </span>
            <p className="text-xs font-medium text-brand-dark">
              {activeWarehouse.type} · Primary · {activeWarehouse.skus} SKUs
            </p>
          </div>
        </div>
        <div>
          <SwitchIcon width={20} />
        </div>
      </button>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard01 label="locations" value="4" icon={<PakageIcon width={24} />} />
        <StatCard01 label="locations" value="4" icon={<PakageIcon width={24} />} />
        <StatCard01 label="locations" value="4" icon={<PakageIcon width={24} />} />
        <StatCard01 label="locations" value="4" icon={<PakageIcon width={24} />} />
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
        <div className="bg-bg-surface px-4 py-3 rounded-[8px]">
          {/* Main Warehouse row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-lighter w-10 h-10 flex justify-center items-center rounded-full text-brand">
                <WareHouseIcon />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <p className="font-semibold text-xs text-text-default">Main Warehouse</p>
                  <span className="bg-[#99BBFF] flex rounded-full font-semibold text-[10px] text-brand-dark px-1 w-fit">
                    Primary
                  </span>
                </div>
                <p className="text-text-muted font-medium text-[10px]">Physical · 180 SKUs</p>
              </div>
            </div>
            <ArrowRightIcon width={20} />
          </div>

          <div className="bg-[#9B9EA34D] h-[1px] w-full my-3" />

          {/* Store A row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-lighter w-10 h-10 flex justify-center items-center rounded-full text-brand">
                <WareHouseIcon />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-xs text-text-default">Store A · Victoria Island</p>
                <p className="text-text-muted font-medium text-[10px]">Store-Warehouse · 67 SKUs</p>
              </div>
            </div>
            <ArrowRightIcon width={20} />
          </div>
        </div>
      </div>

      {/* ── Switch Warehouse Side Drawer ── */}
      <Modal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)}>
        {/* Header */}
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
          Stats and available actions will reflect the selected location.
        </p>

        {/* Warehouse rows */}
        <div className="space-y-2">
          {warehouses.map((wh) => {
            const isSelected = pendingWarehouse.id === wh.id;
            return (
              <button
                key={wh.id}
                type="button"
                onClick={() => setPendingWarehouse(wh)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-brand bg-brand-lighter'
                    : 'border-gray-200 bg-white hover:bg-bg-surface'
                )}
              >
                {/* Warehouse icon */}
                <div
                  className={cn(
                    'w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg',
                    isSelected ? 'bg-white text-brand' : 'bg-bg-surface text-text-muted'
                  )}
                >
                  <WareHouseIcon />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-default truncate">
                      {wh.name}
                    </span>
                    {wh.isPrimary && (
                      <span className="flex-shrink-0 rounded-full bg-[#99BBFF] px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {wh.type} · {wh.skus} SKUs
                  </p>
                </div>

                {/* Radio indicator */}
                <div
                  className={cn(
                    'w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected ? 'border-brand' : 'border-gray-300'
                  )}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setIsSwitcherOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="button"
            onClick={handleConfirm}
          >
            View warehouse
          </Button>
        </div>
      </Modal>
    </div>
  );
}
