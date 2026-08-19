'use client';

import { useEffect, useState } from 'react';
import { financeApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export default function WalletPage() {
  const [overview, setOverview] = useState<any>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      financeApi.getOverview(today, today),
      financeApi.getOpenDebts(),
    ]).then(([ovRes, debtRes]: any) => {
      setOverview(ovRes.data ?? null);
      const d = debtRes.data;
      setDebts(Array.isArray(d) ? d : d?.items ?? []);
    }).catch((err: unknown) => {
      toast.error(err instanceof ApiError ? err.description : 'Failed to load finance data');
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-text-default">Finance Overview</h1>

      {/* Stat cards */}
      {loading ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Revenue', value: fmt(overview?.totalRevenue), color: 'text-emerald-600' },
            { label: 'Total Expenses', value: fmt(overview?.totalExpenses), color: 'text-red-500' },
            { label: 'Gross Profit', value: fmt(overview?.grossProfit), color: 'text-brand' },
            { label: 'Net Profit', value: fmt(overview?.netProfit), color: 'text-brand' },
            { label: 'Payables', value: fmt(overview?.outstandingPayables), color: 'text-amber-600' },
            { label: 'Receivables', value: fmt(overview?.outstandingReceivables), color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-bg-surface rounded-xl p-4">
              <p className="text-xs text-text-muted mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Open Debts */}
      <div>
        <h2 className="text-sm font-semibold text-text-default mb-3">Open Debts</h2>
        {loading ? (
          <div className="text-text-muted text-sm">Loading…</div>
        ) : debts.length === 0 ? (
          <p className="text-text-muted text-sm py-4">No open debts</p>
        ) : (
          <div className="bg-bg-surface rounded-xl overflow-hidden">
            {debts.map((debt: any, idx: number) => (
              <div key={debt.id} className={`flex items-center justify-between px-4 py-3 ${idx < debts.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                <div>
                  <p className="text-xs font-semibold text-text-default">{debt.customerName}</p>
                  <p className="text-[10px] text-text-muted">{debt.narrationCode ?? ''} · {debt.status}</p>
                </div>
                <p className="text-xs font-bold text-red-500">{debt.currency} {debt.outstandingAmount?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
