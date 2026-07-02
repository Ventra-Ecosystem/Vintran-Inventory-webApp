'use client';

import { useState } from 'react';
import { useUIStore } from '@/src/store/uiStore';
import { Menu } from 'lucide-react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { SuppliersTab } from '@/src/features/sales/SuppliersTab';
import { OrdersTab } from '@/src/features/sales/OrdersTab';
import { ReceiveTab as SalesReceiveTab } from '@/src/features/sales/ReceiveTab';
import { SalesMessagesTab } from '@/src/features/sales/SalesMessagesTab';
import { SupplyDashboardTab } from '@/src/features/sales/supply/SupplyDashboardTab';
import { MyListingsTab } from '@/src/features/sales/supply/MyListingsTab';
import { IncomingOrdersTab } from '@/src/features/sales/supply/IncomingOrdersTab';
import { SupplyMessagesTab } from '@/src/features/sales/supply/SupplyMessagesTab';
import { cn } from '@/src/lib/utils';
import { CartIcon, DashSquareIcon, Store02Icon } from '@/src/assets/icon';

type Mode = 'buy' | 'supply';
type BuyTab = 'suppliers' | 'orders' | 'receive' | 'messages';
type SupplyTab = 'dashboard' | 'listings' | 'orders' | 'messages';
type AnyTab = BuyTab | SupplyTab;

interface HeaderOverride {
  title: string;
  onBack: () => void;
}

const buyTabs: { value: BuyTab; label: string }[] = [
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'orders', label: 'Orders' },
  { value: 'receive', label: 'Receive' },
  { value: 'messages', label: 'Messages' },
];

const supplyTabs: { value: SupplyTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'listings', label: 'My listings' },
  { value: 'orders', label: 'Orders' },
  { value: 'messages', label: 'Messages' },
];

export default function SalesPage() {
  const toggleDrawer = useUIStore((s) => s.toggleDrawer);
  const [mode, setMode] = useState<Mode>('buy');
  const [buyTab, setBuyTab] = useState<BuyTab>('suppliers');
  const [supplyTab, setSupplyTab] = useState<SupplyTab>('dashboard');
  const [headerOverride, setHeaderOverride] = useState<HeaderOverride | null>(
    null
  );

  const clearOverride = () => setHeaderOverride(null);

  const headerTitle =
    headerOverride?.title ?? (mode === 'buy' ? 'Suppliers' : 'My supply store');

  const showBack = !!headerOverride;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => headerOverride?.onBack()}
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5 text-neutral-900"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold text-black">{headerTitle}</h1>
        </div>
        {!showBack && (
          <button
            onClick={toggleDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-surface text-brand"
          >
            <DashSquareIcon />
          </button>
        )}
      </div>

      {/* Mode toggle */}
      {!headerOverride && (
        <div className="my-4">
          <div className="flex gap-5 rounded-[8px] bg-bg-surface p-1">
            <button
              onClick={() => setMode('buy')}
              className={cn(
                'flex-1 flex flex-row items-center gap-3 px-2  text-left rounded-lg py-1 font-medium transition-colors',
                mode === 'buy'
                  ? 'bg-brand-lighter text-brand'
                  : 'text-text-subtle'
              )}
            >
              <CartIcon width={20} />
              <div>
                <p className="text-sm">Source</p>
                <p className={cn('text-xs')}>Buy from suppliers</p>
              </div>
            </button>
            <button
              onClick={() => setMode('supply')}
              className={cn(
                'flex-1 flex flex-row items-center gap-3 px-2 text-left rounded-lg py-1 text-xs font-medium transition-colors',
                mode === 'supply'
                  ? 'bg-brand-lighter text-brand'
                  : 'text-text-subtle'
              )}
            >
              <Store02Icon width={20} />
              <div>
                <p className="text-sm">Supply</p>
                <p className="text-xs"> Sell to business</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!headerOverride && (
        <div className="mb-4">
          {mode === 'buy' ? (
            <div>
              <div className="flex gap-3 justify-between overflow-x-auto pb-2">
                {buyTabs.map((opt) => (
                  <div key={opt.value} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setBuyTab(opt.value)}
                      className={cn(
                        'flex-1 whitespace-nowrap rounded-lg text-sm font-medium transition-colors',
                        buyTab === opt.value
                          ? 'text-text-default'
                          : 'text-text-helper'
                      )}
                    >
                      {opt.label}
                    </button>

                    <div
                      className={cn(
                        'h-[2px] w-8 transition-colors mt-0.5',
                        buyTab === opt.value ? 'bg-brand' : 'bg-transparent'
                      )}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex gap-3 justify-between overflow-x-auto pb-2">
                {supplyTabs.map((opt) => (
                  <div key={opt.value} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSupplyTab(opt.value)}
                      className={cn(
                        'flex-1 whitespace-nowrap rounded-lg text-sm font-medium transition-colors',
                        supplyTab === opt.value
                          ? 'text-text-default'
                          : 'text-text-helper'
                      )}
                    >
                      {opt.label}
                    </button>

                    <div
                      className={cn(
                        'h-[2px] w-8 transition-colors mt-0.5',
                        supplyTab === opt.value ? 'bg-brand' : 'bg-transparent'
                      )}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="">
        {mode === 'buy' && (
          <>
            {buyTab === 'suppliers' && (
              <SuppliersTab
                onHeaderChange={setHeaderOverride}
                onClearOverride={clearOverride}
              />
            )}
            {buyTab === 'orders' && (
              <OrdersTab
                onHeaderChange={setHeaderOverride}
                onClearOverride={clearOverride}
              />
            )}
            {buyTab === 'receive' && <SalesReceiveTab />}
            {buyTab === 'messages' && (
              <SalesMessagesTab
                onHeaderChange={setHeaderOverride}
                onClearOverride={clearOverride}
              />
            )}
          </>
        )}
        {mode === 'supply' && (
          <>
            {supplyTab === 'dashboard' && <SupplyDashboardTab />}
            {supplyTab === 'listings' && (
              <MyListingsTab
                onHeaderChange={setHeaderOverride}
                onClearOverride={clearOverride}
              />
            )}
            {supplyTab === 'orders' && (
              <IncomingOrdersTab
                onHeaderChange={setHeaderOverride}
                onClearOverride={clearOverride}
              />
            )}
            {supplyTab === 'messages' && <SupplyMessagesTab />}
          </>
        )}
      </div>
    </main>
  );
}
