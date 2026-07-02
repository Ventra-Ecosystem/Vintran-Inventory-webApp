'use client';

import { useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { SupplierOverview } from './SupplierOverview';
import { SupplierProducts } from './SupplierProducts';
import { SupplierOrders } from './SupplierOrders';
import { SupplierChat } from './SupplierChat';
import type { Supplier, HeaderOverride } from './types';
import { useTabBar } from '@/src/hooks/useTabBar';

type ProfileTab = 'overview' | 'products' | 'orders' | 'messages';

const profileTabs: { value: ProfileTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' },
  { value: 'messages', label: 'Messages' },
];

interface SupplierProfileProps {
  supplier: Supplier;
  onHeaderChange: (o: HeaderOverride) => void;
  onBack: () => void;
}

export function SupplierProfile({
  supplier,
  onHeaderChange,
  onBack,
}: SupplierProfileProps) {
  useTabBar(false);
  const [tab, setTab] = useState<ProfileTab>('overview');

  return (
    <div className="space-y-4">
      <SegmentedTabs options={profileTabs} value={tab} onChange={setTab} />

      {tab === 'overview' && <SupplierOverview supplier={supplier} />}
      {tab === 'products' && (
        <SupplierProducts
          supplier={supplier}
          onHeaderChange={onHeaderChange}
          onBack={onBack}
        />
      )}
      {tab === 'orders' && <SupplierOrders supplier={supplier} />}
      {tab === 'messages' && <SupplierChat supplier={supplier} />}
    </div>
  );
}
