'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IdeaIcon, ArrowdownIcon } from '@/src/assets/icon';
import { StatCard02 } from '@/src/components/ui/StatCard02';
import { dashboardApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

function SectionGrid({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-medium text-text-subtle mb-2">{title}</p>
      <div className="grid grid-cols-2 bg-bg-surface py-4 px-3 rounded-2xl gap-2">{children}</div>
    </div>
  );
}

export default function BusinessOverviewPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dashboardApi.getSummary({ from: today, to: today })
      .then((res: any) => setSummary(res.data ?? null))
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Always show a value — null from API means ₦0, loading shows …
  const p = (v: number | null | undefined) => loading ? '…' : fmt(v ?? null);

  return (
    <div className="w-full">
      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/home/dashboard" className="px-4 py-1.5 rounded-full text-sm font-medium text-text-subtle hover:bg-bg-surface transition-colors">Dashboard</Link>
        <span className="px-4 py-1.5 rounded-full bg-brand text-white text-sm font-medium">Business Overview</span>
      </div>

      {/* Note */}
      <div className="flex items-start justify-between bg-amber-lighter rounded-xl px-4 py-3 mb-5 border border-yellow-200">
        <div>
          <p className="text-sm font-semibold text-text-default mb-0.5">Note</p>
          <p className="text-sm text-text-subtle">(₦0) means no transactions yet or no permission for that section</p>
        </div>
        <IdeaIcon width={36} className="shrink-0 ml-4" />
      </div>

      {/* Today filter */}
      <div className="flex justify-end mb-4">
        <button type="button" className="flex items-center gap-1 px-3 py-1.5 bg-bg-surface rounded-full text-xs font-medium text-text-subtle">
          Today <ArrowdownIcon width={14} />
        </button>
      </div>

      <SectionGrid title="Sales">
        <StatCard02 value={p(summary?.totalSales)} label="Total Sales" />
        <StatCard02 value={p(summary?.salesProfit)} label="Sales Profit" />
        <StatCard02 value={p(summary?.creditSaleRevenue)} label="Credit sale" />
        <StatCard02 value={p(summary?.totalDiscount)} label="Discount" />
      </SectionGrid>

      <SectionGrid title="Income/Expense">
        <StatCard02 value={p(summary?.income)} label="Income" valueClassName="text-emerald-dark" />
        <StatCard02 value={p(summary?.expense)} label="Expense" valueClassName="text-error-dark" />
      </SectionGrid>

      <SectionGrid title="Debt Book">
        <StatCard02 value={p(summary?.customerCredit)} label="Customer Credit" valueClassName="text-error-dark" />
        <StatCard02 value={p(null)} label="Balance" valueClassName="text-emerald-dark" />
      </SectionGrid>

      <SectionGrid title="Product">
        <StatCard02 value={loading ? '…' : `${summary?.productQuantity ?? 0}`} label="Product quantity" />
        <StatCard02 value={p(summary?.stockValue)} label="Products value" valueClassName="text-emerald-dark" />
      </SectionGrid>
    </div>
  );
}
