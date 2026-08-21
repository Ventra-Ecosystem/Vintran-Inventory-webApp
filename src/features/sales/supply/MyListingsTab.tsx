'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PakageIcon } from '@/src/assets/icon';
import type { HeaderOverride } from '../types';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

interface MyListingsTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function MyListingsTab({ onHeaderChange, onClearOverride }: MyListingsTabProps) {
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    b2bApi.getMyListings()
      .then((res: any) => setListings(toArr(res.data)))
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.description : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter((l: any) =>
    (l.productName ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs text-text-subtle">Total listings</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{listings.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs text-text-subtle">Active</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{listings.filter((l: any) => l.isActive).length}</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listings" className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 text-sm focus:border-brand focus:outline-none" />
      </div>

      {loading ? (
        <div className="text-text-muted text-sm py-8 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-text-muted text-sm py-8 text-center">No listings yet</div>
      ) : (
        <div className="bg-bg-surface rounded-[8px]">
          {filtered.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center border-b border-[#9B9EA34D] py-3 px-4 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div>
                  <p className="text-text-default font-semibold text-xs">{item.productName ?? item.productId}</p>
                  <p className="text-text-muted font-medium text-[10px]">{item.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-default text-xs font-semibold">₦{(item.unitPrice ?? 0).toLocaleString()}</p>
                <p className="text-text-helper text-xs font-medium">{item.quantityAvailable ?? 0} units</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
