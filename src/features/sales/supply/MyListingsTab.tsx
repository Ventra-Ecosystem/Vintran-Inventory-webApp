'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { PakageIcon } from '@/src/assets/icon';
import type { HeaderOverride } from '../types';

const listings = [
  {
    id: '1',
    name: 'Rice (50kg bag)',
    price: '₦65,000',
    stock: 200,
    category: 'Grains',
  },
  {
    id: '2',
    name: 'Cooking oil (5L)',
    price: '₦8,500',
    stock: 500,
    category: 'Oils',
  },
];

interface MyListingsTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function MyListingsTab({
  onHeaderChange,
  onClearOverride,
}: MyListingsTabProps) {
  const [query, setQuery] = useState('');

  const filtered = listings.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs text-text-subtle">Total listings</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">
            {listings.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs text-text-subtle">Total stock</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">700</p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings"
          className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="bg-bg-surface rounded-[8px]">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b border-[#9B9EA34D] py-3 px-4 last:border-0"
          >
            <div className="flex gap-2 items-center">
              <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                <PakageIcon width={24} />
              </div>
              <div>
                <p className="text-text-default font-semibold text-xs">
                  {item.name}
                </p>
                <p className="text-text-muted font-medium text-[10px]">
                  {item.category}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-default text-xs font-semibold">
                {item.price}
              </p>
              <p className="text-text-helper text-xs font-medium">
                {item.stock} units
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">
          Recent orders
        </p>
        <div className="bg-bg-surface rounded-[8px]">
          {['ORD-2201 · Pending', 'ORD-2198 · Delivered'].map((line) => (
            <div
              key={line}
              className="flex justify-between px-4 py-3 border-b border-[#9B9EA34D] last:border-0"
            >
              <p className="text-xs font-medium text-text-default">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
