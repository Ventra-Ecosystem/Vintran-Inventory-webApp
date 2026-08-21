'use client';

import { useEffect, useState } from 'react';
import { financeApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { fmt, fmtDate } from './utils';

export function DebtTab() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');

  useEffect(() => {
    setLoading(true);
    financeApi.getOpenDebts({ overdueOnly: filter === 'overdue' })
      .then((res: any) => setDebts(toArr(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const repay = async (id: string, amount: number) => {
    try {
      await financeApi.repayDebt(id, amount);
      setDebts(prev => prev.filter(d => d.id !== id));
      toast.success('Debt marked as repaid');
    } catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
  };

  const writeOff = async (id: string) => {
    try {
      await financeApi.writeOffDebt(id, 'Written off by manager');
      setDebts(prev => prev.filter(d => d.id !== id));
      toast.success('Debt written off');
    } catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
  };

  const total = debts.reduce((s, d) => s + (d.amount ?? d.outstandingAmount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-[#F8FAFC] rounded-2xl p-4 flex items-center justify-between border border-gray-100">
        <div>
          <p className="text-xs text-text-muted">Total Open Debts</p>
          <p className="text-2xl font-bold text-red-500">{fmt(total)}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'overdue'] as const).map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', f === filter ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500')}>
              {f === 'all' ? 'All' : 'Overdue'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted text-center py-8">Loading…</p>
      ) : debts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-text-muted">No open debts 🎉</p>
        </div>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {debts.map((debt: any, idx: number) => (
            <div key={debt.id} className={cn('px-4 py-3', idx < debts.length - 1 && 'border-b border-[#9B9EA34D]')}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-text-default">{debt.customerName ?? '—'}</p>
                  <p className="text-xs text-text-muted">{debt.narration ?? 'Debt'}</p>
                  {debt.dueDate && <p className="text-[10px] text-text-muted">Due: {fmtDate(debt.dueDate)}</p>}
                </div>
                <p className="text-sm font-bold text-red-500">{fmt(debt.amount ?? debt.outstandingAmount)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => repay(debt.id, debt.amount ?? debt.outstandingAmount)} className="flex-1 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors">
                  Mark Paid
                </button>
                <button type="button" onClick={() => writeOff(debt.id)} className="flex-1 h-8 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                  Write Off
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
