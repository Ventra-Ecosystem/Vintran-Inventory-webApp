'use client';

import { useEffect, useState } from 'react';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { Search, Gift } from 'lucide-react';

export function BenefitsView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    suppliersApi.list()
      .then((res: any) => setSuppliers(toArr(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadBenefits = (supplier: any) => {
    setSelectedSupplier(supplier);
    suppliersApi.getBenefits(supplier.id)
      .then((res: any) => setBenefits(toArr(res.data)))
      .catch(() => setBenefits([]));
  };

  const filtered = suppliers.filter((s: any) =>
    (s.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (selectedSupplier) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button type="button" onClick={() => { setSelectedSupplier(null); setBenefits([]); }} className="text-sm text-brand font-medium">← Back</button>
          <p className="font-semibold text-text-default">{selectedSupplier.name} — Benefits</p>
        </div>
        {benefits.length === 0 ? (
          <div className="text-center py-12">
            <Gift size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No benefits from this supplier yet</p>
          </div>
        ) : (
          <div className="bg-bg-surface rounded-xl overflow-hidden">
            {benefits.map((b: any, idx: number) => (
              <div key={b.id ?? idx} className={`px-4 py-3 ${idx < benefits.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-default">{b.type}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {b.percentageValue != null ? `${b.percentageValue}%` : b.amountValue != null ? `₦${Number(b.amountValue).toLocaleString()}` : b.integerValue != null ? `${b.integerValue} units` : '—'}
                    </p>
                    {b.minimumOrderQuantity && (
                      <p className="text-xs text-text-muted">Min order: {b.minimumOrderQuantity}</p>
                    )}
                    {b.expiresOnUtc && (
                      <p className="text-xs text-text-muted">Expires: {new Date(b.expiresOnUtc).toLocaleDateString()}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center h-11 bg-[#F8FAFC] rounded-[22px] px-4 gap-2 border border-[#F1F5F9]">
        <Search size={16} className="text-[#94A3B8] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="flex-1 h-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
        />
      </div>
      <p className="text-sm text-text-muted">Select a supplier to view their benefits</p>
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No suppliers found</p>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {filtered.map((s: any, idx: number) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadBenefits(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left ${idx < filtered.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-sm shrink-0">
                {(s.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-default truncate">{s.name}</p>
                <p className="text-xs text-text-muted">{s.email ?? s.phoneNumber ?? '—'}</p>
              </div>
              <Gift size={16} className="text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
