'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IdeaIcon } from '@/src/assets/icon';
import { dashboardApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { ChevronDown } from 'lucide-react';

type RangeOption = 'Today' | 'This Week' | 'This Month';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

function toIsoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function rangeFor(option: RangeOption): { from: string; to: string } {
  const now = new Date();
  const to = toIsoDate(now);
  if (option === 'Today') return { from: to, to };
  if (option === 'This Week') {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    return { from: toIsoDate(monday), to };
  }
  // This Month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toIsoDate(firstOfMonth), to };
}

// ── Section grid — matches mobile's 2-col white-card layout ───────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[13px] font-semibold text-[#64748B] mb-2">{title}</p>
      <div className="bg-[#F8FAFC] rounded-2xl p-2 grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

function StatCell({ value, label, valueClass }: { value: string; label: string; valueClass?: string }) {
  return (
    <div className="bg-white rounded-xl p-3.5">
      <p className={`text-[17px] font-bold text-[#0A0D14] mb-1 ${valueClass ?? ''}`}>{value}</p>
      <p className="text-xs text-[#64748B]">{label}</p>
    </div>
  );
}

export default function BusinessOverviewPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeOption>('Today');

  const RANGES: RangeOption[] = ['Today', 'This Week', 'This Month'];

  const cycleRange = () => {
    setRange(prev => {
      const idx = RANGES.indexOf(prev);
      return RANGES[(idx + 1) % RANGES.length];
    });
  };

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    dashboardApi.getSummary(rangeFor(range))
      .then((res: any) => setSummary(res.data ?? null))
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) console.error(err);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const p = (v: number | null | undefined) => (loading ? '…' : fmt(v));

  return (
    <div className="w-full">
      {/* ── Segmented pill tabs ── */}
      <div className="flex justify-center mb-5">
        <div className="flex bg-[#F8FAFC] rounded-full p-1">
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-full text-sm font-bold text-[#64748B] hover:text-[#0A0D14] transition-colors"
          >
            Dashboard
          </Link>
          <span className="px-5 py-2 rounded-full bg-brand text-white text-sm font-bold">
            Business Overview
          </span>
        </div>
      </div>

      {/* ── Note ── */}
      <div className="flex items-start gap-3 bg-[#FFFBEB] rounded-2xl px-4 py-3.5 mb-4 border border-[#FDE68A]">
        <div className="flex-1">
          <p className="text-[13px] font-bold text-[#92400E] mb-0.5">Note</p>
          <p className="text-xs text-[#78350F] leading-relaxed">
            (XXXX) signifies you have no permission to view available information
          </p>
        </div>
        <IdeaIcon width={22} className="shrink-0 text-[#D97706]" />
      </div>

      {/* ── Range filter ── */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={cycleRange}
          className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2 rounded-full text-[13px] font-medium text-[#334155] hover:bg-gray-100 transition-colors"
        >
          {range}
          <ChevronDown size={14} className="text-[#64748B]" />
        </button>
      </div>

      {/* ── Sales ── */}
      <Section title="Sales">
        <StatCell value={p(summary?.totalSales)} label="Total Sales" />
        <StatCell value={p(summary?.salesProfit)} label="Sales Profit" />
        <StatCell value={p(summary?.creditSaleRevenue)} label="Credit sale" />
        <StatCell value={p(summary?.totalDiscount)} label="Discount" />
      </Section>

      {/* ── Income/Expense ── */}
      <Section title="Income/Expense">
        <StatCell value={p(summary?.income)} label="Income" valueClass="text-[#16A34A]" />
        <StatCell value={p(summary?.expense)} label="Expense" valueClass="text-[#DC2626]" />
      </Section>

      {/* ── Debt Book ── */}
      <Section title="Debt Book">
        <StatCell value={p(summary?.customerCredit)} label="Customer Credit" valueClass="text-[#DC2626]" />
        <StatCell value="₦0" label="Balance" />
      </Section>

      {/* ── Product ── */}
      <Section title="Product">
        <StatCell value={loading ? '…' : String(summary?.productQuantity ?? 0)} label="Product quantity" />
        <StatCell value={p(summary?.stockValue)} label="Products value" valueClass="text-[#16A34A]" />
      </Section>
    </div>
  );
}
