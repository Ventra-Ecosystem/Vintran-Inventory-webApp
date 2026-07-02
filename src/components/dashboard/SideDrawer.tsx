// src/components/dashboard/SideDrawer.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/src/store/uiStore';
import { cn } from '@/src/lib/utils';
import {
  AnalyticsIcon,
  ArrowRightIcon,
  BuildingIcon,
  MoneyIcon,
  PakageIcon,
  PlusIcon,
  StoreIcon,
  SupportIcon,
  SwitchIcon,
  UserIcon,
  UserIcon2,
  WareHouseIcon,
} from '@/src/assets/icon';

// TODO: replace with real API call
const stores = [
  { id: '1', name: 'Main Store' },
  { id: '2', name: 'Warehouse Outlet' },
];

const drawerLinks = [
  {
    href: '/warehouse-management',
    label: 'Warehouse management',
    icon: WareHouseIcon,
  },
  { href: '', label: 'Inventory management', icon: PakageIcon },
  { href: '', label: 'Money In & Money Out', icon: MoneyIcon },
  { href: '', label: 'Customers & Debt', icon: UserIcon },
  { href: '', label: 'Staff Management', icon: AnalyticsIcon },
  { href: '', label: 'Business Report', icon: MoneyIcon },
  { href: '', label: 'Invoice', icon: AnalyticsIcon },
];

export function SideDrawer() {
  const isOpen = useUIStore((state) => state.isDrawerOpen);
  const closeDrawer = useUIStore((state) => state.closeDrawer);
  const [isStoresExpanded, setIsStoresExpanded] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={cn(
          'fixed inset-0 z-50 bg-[#0D0D0D3D] backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-[75%] px-padding pt-padding max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col gap-3 rounded-bl-[24px] rounded-tl-[24px] overflow-scroll',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex gap-5 items-center">
          <div className="bg-bg-surface w-10 h-10 flex rounded-full items-center justify-center">
            <BuildingIcon />
          </div>
          <div>
            <p className="font-semibold text-xl text-black">JT Business</p>
            <div className="text-brand flex items-center">
              <p className="text-brand font-medium text-xs">
                Switch/Create New Business
              </p>
              <ArrowRightIcon width={24} />
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-border-muted opacity-40"></div>

        <nav className="flex flex-col gap-9">
          <div>
            {/* Stores — toggles open in place instead of navigating */}
            <button
              type="button"
              onClick={() => setIsStoresExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-primary-alpha-10 hover:text-brand"
            >
              <div className="flex gap-2 items-center">
                <StoreIcon width={16} />
                <p className="text-xs font-medium text-text-subtle">Stores</p>
              </div>
              <ArrowRightIcon
                width={16}
                className={cn(
                  'transition-transform duration-200',
                  isStoresExpanded && 'rotate-90'
                )}
              />
            </button>

            {isStoresExpanded && (
              <div className="flex flex-col bg-bg-surface rounded-[12px] p-2.5">
                <Link
                  href="/stores/new"
                  onClick={closeDrawer}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-text-subtle active:text-brand"
                >
                  <PlusIcon width={16} />
                  Create new store
                </Link>
                {stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={closeDrawer}
                    className="flex items-center gap-2 py-1.5 px-2 text-left text-xs font-medium text-text-subtle active:text-brand"
                  >
                    <StoreIcon width={16} />
                    {store.name}
                  </button>
                ))}
              </div>
            )}

            {drawerLinks.map(({ href, label, icon: Icon }, index) => (
              <Link
                key={index}
                href={href}
                onClick={closeDrawer}
                className="flex items-center justify-between rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-primary-alpha-10 hover:text-brand"
              >
                <div className="flex gap-2 items-center">
                  <Icon width={16} />
                  <p className="text-xs font-medium text-text-subtle">
                    {label}
                  </p>
                </div>
                <ArrowRightIcon width={16} />
              </Link>
            ))}
          </div>

          <div>
            <Link
              href={''}
              onClick={closeDrawer}
              className="flex items-center justify-between rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-primary-alpha-10 hover:text-brand"
            >
              <div className="flex gap-2 items-center">
                <SwitchIcon width={16} />
                <p className="text-xs font-medium text-text-subtle">
                  Switch User
                </p>
              </div>
              <ArrowRightIcon width={16} />
            </Link>

            <Link
              href={''}
              onClick={closeDrawer}
              className="flex items-center justify-between rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-primary-alpha-10 hover:text-brand"
            >
              <div className="flex gap-2 items-center">
                <SupportIcon width={16} />
                <p className="text-xs font-medium text-text-subtle">
                  Contact Support
                </p>
              </div>
              <ArrowRightIcon width={16} />
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col justify-end mb-padding">
          <div className="bg-bg-surface py-3 px-2 rounded-[8px] flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <UserIcon2 width={20} />
              </div>
              <div className="flex flex-col justify-between">
                <p className="font-semibold text-base text-black">
                  Esele Agboighale
                </p>
                <p className="text-text-subtle font-medium text-xs">
                  Business Owner
                </p>
              </div>
            </div>
            <div>
              <ArrowRightIcon width={20} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
