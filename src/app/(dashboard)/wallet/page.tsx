'use client';

import { useEffect, useState } from 'react';
import { Plus, TrendingUp, ShoppingCart, PieChart, FileText, DollarSign, User, Home, Info, Search } from 'lucide-react';
import { financeApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';

type MainTab = 'Overview' | 'Ledger' | 'Expenses' | 'Balancing';

function fmt(n?: number | null) { return `₦${(n ?? 0).toLocaleString()}`; }
function todayIso() { return new Date().toISOString().slice(0, 10); }
function daysAgoIso(d: number) { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt.toISOString().slice(0, 10); }

const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Transport', 'RunningCosts', 'Delivery', 'Marketing', 'Supplies', 'Repairs', 'Other'];

// ── Date Range Picker ─────────────────────────────────────────────────────
function DateRange({ from, to, onChange }: { from: string; to: string; onChange: (f: string, t: string) => void }) {
  return (
    <div className="flex gap-2 items-center">
      <input type="date" value={from} onChange={e => onChange(e.target.value, to)} className="flex-1 h-10 rounded-[10px] border border-gray-200 px-3 text-xs focus:border-brand focus:outline-none" />
      <span className="text-text-muted text-sm">–</span>
      <input type="date" value={to} onChange={e => onChange(from, e.target.value)} className="flex-1 h-10 rounded-[10px] border border-gray-200 px-3 text-xs focus:border-brand focus:outline-none" />
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────
export default function WalletPage() {
  const [overview, setOverview] = useState<any>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());

  useEffect(() => {
    setLoading(true);
    Promise.all([financeApi.getOverview(from, to), financeApi.getOpenDebts()])
      .then(([ovRes, debtRes]: any[]) => {
        setOverview(ovRes.data ?? null);
        setDebts(toArr(debtRes.data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [from, to]);

  const stats = [
    { label: 'Total Revenue', value: fmt(overview?.totalRevenue), color: 'text-emerald-600', Icon: TrendingUp },
    { label: 'Total COGS', value: fmt(overview?.totalCogs), color: 'text-amber-600', Icon: ShoppingCart },
    { label: 'Gross Profit', value: fmt(overview?.grossProfit), color: 'text-emerald-600', Icon: PieChart },
    { label: 'Total Expenses', value: fmt(overview?.totalExpenses), color: 'text-red-500', Icon: FileText },
    { label: 'Net Profit', value: fmt(overview?.netProfit), color: 'text-brand', Icon: DollarSign },
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-text-muted">Performance Summary</p>
      <DateRange from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />

      {loading ? <p className="text-sm text-text-muted text-center py-6">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, color, Icon }) => (
              <div key={label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <Icon size={16} className="text-text-muted" />
                </div>
                <p className="text-xs text-text-muted">{label}</p>
                <p className={cn("text-base font-bold mt-1", color)}>{value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
