'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import {
  ArrowRightIcon,
  BlueCheckIcon,
  GreenCheckIcon,
  PackageReceiveIcon,
  PakageIcon,
  StarIcon,
} from '@/src/assets/icon';
import { AddSupplierView } from './AddSupplierView';
import { SupplierProfile } from './SupplierProfile';
import type { Supplier, HeaderOverride } from './types';
import { ProfileImg } from '@/src/assets/images';
import Image from 'next/image';
import { Badge } from '@/src/components/ui/Badge';

// TODO: replace with real API call
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Agro Supplies Ltd',
    contact: 'Emeka Obi',
    phone: '+234 800 000 0001',
    email: 'emeka@agro.ng',
    address: 'Lagos, Nigeria',
    category: 'Grains',
  },
  {
    id: '2',
    name: 'PetroBase NG',
    contact: 'Aisha Musa',
    phone: '+234 800 000 0002',
    email: 'aisha@petrobase.ng',
    address: 'Abuja, Nigeria',
    category: 'Oils',
  },
];

const topSuppliers = mockSuppliers.slice(0, 4);

const recentActivity = [
  {
    id: '1',
    text: 'Order #1042 received from Agro Supplies Ltd',
    date: 'Today, 9:00am',
  },
  { id: '2', text: 'New message from PetroBase NG', date: 'Yesterday, 3:20pm' },
];

type SubView =
  | { type: 'list' }
  | { type: 'add-supplier' }
  | { type: 'supplier-profile'; supplier: Supplier };

interface SuppliersTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function SuppliersTab({
  onHeaderChange,
  onClearOverride,
}: SuppliersTabProps) {
  const [subView, setSubView] = useState<SubView>({ type: 'list' });
  const [query, setQuery] = useState('');

  const goToList = () => {
    setSubView({ type: 'list' });
    onClearOverride();
  };

  const goToAddSupplier = () => {
    setSubView({ type: 'add-supplier' });
    onHeaderChange({ title: 'Add supplier', onBack: goToList });
  };

  const goToProfile = (supplier: Supplier) => {
    setSubView({ type: 'supplier-profile', supplier });
    onHeaderChange({ title: supplier.name, onBack: goToList });
  };

  if (subView.type === 'add-supplier') {
    return (
      <AddSupplierView
        onSaved={goToList}
        onCancel={goToList}
        onViewProfile={goToProfile}
      />
    );
  }

  if (subView.type === 'supplier-profile') {
    return (
      <SupplierProfile
        supplier={subView.supplier}
        onHeaderChange={onHeaderChange}
        onBack={goToList}
      />
    );
  }

  const filtered = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex-col flex gap-4">
        <div className="px-4 h-11 bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search suppliers..."
            className="flex-1 flex h-full outline-0"
          />
        </div>

        <button
          type="button"
          onClick={goToAddSupplier}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[32px] bg-brand px-4 text-xs font-medium text-white"
        >
          <Plus size={20} />
          Add new
        </button>
      </div>

      {/* Top suppliers horizontal scroll */}
      <div>
        <div className="flex justify-between">
          <p className="text-sm font-medium text-text-subtle">Top suppliers</p>

          <p className="text-brand font-medium text-sm flex">
            See all <ArrowRightIcon width={20} />
          </p>
        </div>
        <div className="flex gap-3 justify-between my-4">
          {topSuppliers.map((s) => (
            <div
              key={s.id}
              onClick={() => goToProfile(s)}
              className="flex-1 bg-bg-surface rounded-[4px] py-3 px-2 text-left"
            >
              <div className="relative h-8 w-8">
                <div className="overflow-hidden rounded-full bg-brand-lighter">
                  <Image
                    src={ProfileImg}
                    alt="Profile"
                    className="object-cover"
                  />
                </div>

                <BlueCheckIcon
                  className="absolute top-0 z-10"
                  style={{ right: -10 }}
                />
              </div>
              <p className="text-text-default text-xs font-semibold">
                {s.name}
              </p>
              <p className="text-text-subtle font-medium text-[10px]">
                {s.category}
              </p>
              <div className="flex">
                <StarIcon />{' '}
                <p className="text-black font-medium text-[10px]">
                  {' '}
                  4.9 (2.4k reviews)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your suppliers list */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-text-subtle">Your suppliers</p>

          <p className="text-brand font-medium text-sm flex">
            See all <ArrowRightIcon width={20} />
          </p>
        </div>
        <div className="bg-bg-surface py-3 rounded-[8px] px-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0"
              onClick={() => goToProfile(s)}
            >
              <div className="flex flex-1 justify-between">
                <div className="flex items-center gap-4 ">
                  <div className="relative h-8 w-8">
                    <div className="overflow-hidden rounded-full bg-brand-lighter">
                      <Image
                        src={ProfileImg}
                        alt="Profile"
                        className="object-cover"
                      />
                    </div>

                    <BlueCheckIcon
                      className="absolute top-0 z-10"
                      style={{ right: -10 }}
                    />
                  </div>
                  <div className="flex justify-between flex-col h-full">
                    <p className="text-text-default font-semibold text-xs">
                      {s.name}
                    </p>

                    <div className="flex gap-2">
                      <Badge
                        textStyle={{ color: '#162664', fontSize: 11 }}
                        style={{ backgroundColor: '#C2D6FF' }}
                      >
                        Active
                      </Badge>

                      <Badge
                        leftIcon={<GreenCheckIcon />}
                        textStyle={{ color: '#176448', fontSize: 11 }}
                        style={{ backgroundColor: '#CBF5E5' }}
                      >
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex text-black text-xs font-semibold">
                    <StarIcon />
                    <p>4.9</p>
                  </div>

                  <p className="text-text-helper font-medium text-xs">
                    20 orders
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}

      <div>
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-text-subtle">
            Recent Activity
          </p>

          <p className="text-brand font-medium text-sm flex">
            See all <ArrowRightIcon width={20} />
          </p>
        </div>
        <div className="bg-bg-surface py-3 rounded-[8px] px-3">
          {recentActivity.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0"
            >
              <div className="flex flex-1 justify-between">
                <div className="flex items-center gap-4 ">
                  <div className="relative h-10 w-10 rounded-full flex justify-center items-center bg-brand-lighter">
                    <PackageReceiveIcon width={24} />
                  </div>
                  <div className="flex justify-between flex-col h-full">
                    <p className="text-text-default font-semibold text-xs">
                      {r.text}
                    </p>

                    <div className="flex gap-2">
                      <p className="font-medium text-text-muted text-[10px]">
                        {r.date}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ArrowRightIcon width={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
