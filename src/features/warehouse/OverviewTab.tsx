// src/features/warehouse/OverviewTab.tsx
'use client';

import { useState } from 'react';
import {
  Repeat,
  ArrowDownToLine,
  ArrowLeftRight,
  MapPin,
  SlidersHorizontal,
  History,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import {
  ArrowRightIcon,
  PakageIcon,
  SwitchIcon,
  WareHouseIcon,
} from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { TransactionItem } from '@/src/components/ui/TransactionItem';

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
  { id: '1', name: 'Main Warehouse' },
  { id: '2', name: 'Secondary Depot' },
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

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setIsSwitcherOpen(true)}
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
              Physical · Primary · 180 SKUs
            </p>
          </div>
        </div>
        <div>
          <SwitchIcon width={20} />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <StatCard01
          label="locations"
          value="4"
          icon={<PakageIcon width={24} />}
        />

        <StatCard01
          label="locations"
          value="4"
          icon={<PakageIcon width={24} />}
        />

        <StatCard01
          label="locations"
          value="4"
          icon={<PakageIcon width={24} />}
        />

        <StatCard01
          label="locations"
          value="4"
          icon={<PakageIcon width={24} />}
        />
      </div>

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

      <div>
        <p className="pb-3 text-text-subtle text-sm font-medium">
          Active Locations
        </p>

        <div className="bg-bg-surface px-4 py-3 rounded-[8px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-lighter w-10 h-10 flex justify-center items-center rounded-full text-brand">
                <WareHouseIcon />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <p className="font-semibold text-xs text-text-default">
                    Main Warehouse
                  </p>{' '}
                  <span className="bg-[#99BBFF] flex rounded-full font-semibold text-[10px] text-brand-dark px-1 w-fit">
                    Primary
                  </span>
                </div>
                <p className="text-text-muted font-medium text-[10px]">
                  Physical · 180 SKUs
                </p>
              </div>
            </div>
            <div>
              <ArrowRightIcon width={20} />
            </div>
          </div>

          <div className="bg-[#9B9EA34D] h-[1px] w-full my-3"></div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-lighter w-10 h-10 flex justify-center items-center rounded-full text-brand">
                <WareHouseIcon />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <p className="font-semibold text-xs text-text-default">
                    Main Warehouse
                  </p>{' '}
                </div>
                <p className="text-text-muted font-medium text-[10px]">
                  Physical · 180 SKUs
                </p>
              </div>
            </div>
            <div>
              <ArrowRightIcon width={20} />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)}>
        <h2 className="text-lg font-semibold text-neutral-900">
          Switch warehouse
        </h2>
        <div className="mt-4 space-y-2">
          {warehouses.map((wh) => (
            <button
              key={wh.id}
              type="button"
              onClick={() => {
                setActiveWarehouse(wh);
                setIsSwitcherOpen(false);
              }}
              className="w-full rounded-xl border border-neutral-100 px-4 py-3 text-left text-sm font-medium text-neutral-900"
            >
              {wh.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(false)}
            className="w-full rounded-xl py-3 text-center text-sm font-medium text-text-subtle"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
