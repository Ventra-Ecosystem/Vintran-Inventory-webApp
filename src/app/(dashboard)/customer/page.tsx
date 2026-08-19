'use client';

import { useEffect, useState } from 'react';
import { customersApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    customersApi.list({ search })
      .then((res: any) => {
        const d = res.data;
        setCustomers(Array.isArray(d) ? d : d?.items ?? []);
      })
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.description : 'Failed to load customers'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-text-default">Customers</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone…"
        className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
      />

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">No customers yet</p>
          <p className="text-text-muted text-xs mt-1">Customers added from the mobile app will appear here</p>
        </div>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {customers.map((c: any, idx: number) => (
            <div
              key={c.id}
              className={`flex items-center justify-between px-4 py-3 ${idx < customers.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}
            >
              <div>
                <p className="text-xs font-semibold text-text-default">{c.firstName} {c.lastName}</p>
                <p className="text-[10px] text-text-muted">{c.phoneNumber}</p>
              </div>
              {c.outstandingDebt > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-text-muted">Debt</p>
                  <p className="text-xs font-bold text-red-500">{c.currency} {c.outstandingDebt.toLocaleString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
