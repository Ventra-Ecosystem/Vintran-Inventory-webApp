'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowleftdownIcon,
  ArrowRightIcon,
  MoneyIcon,
  PakageIcon,
  StoreIcon,
  WareHouseIcon,
} from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { TransactionItem } from '@/src/components/ui/TransactionItem';
import { dashboardApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

const ACTIONS = [
  { icon: <WareHouseIcon width={22} />, label: 'Warehouse Set up', sub: 'Set your warehouse', href: '/warehouse-management' },
  { icon: <PakageIcon width={22} />, label: 'Add product', sub: 'Add your first product', href: '/product' },
  { icon: <MoneyIcon width={22} />, label: 'Record Sales', sub: 'Record a sale', href: '/sales' },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dashboardApi.getSummary({ from: today, to: today })
      .then((res: any) => setSummary(res.data ?? null))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status !== 403) {
          toast.error(err.description);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: <MoneyIcon width={22} />, value: loading ? '…' : fmt(summary?.totalSales), label: "Today's Sales" },
    { icon: <PakageIcon width={22} />, value: loading ? '…' : String(summary?.lowStockCount ?? 0), label: 'Low Stock' },
    { icon: <StoreIcon width={22} />, value: loading ? '…' : fmt(summary?.stockValue), label: 'Stock Value' },
    { icon: <WareHouseIcon width={22} />, value: loading ? '…' : fmt(summary?.salesProfit), label: 'Sales Profit' },
  ];

  const activity: any[] = summary?.recentActivity ?? [];

  return (
    <div className="w-full">
      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-4 py-1.5 rounded-full bg-brand text-white text-sm font-medium">Dashboard</span>
        <Link href="/dashboard/overview" className="px-4 py-1.5 rounded-full text-sm font-medium text-text-subtle hover:bg-bg-surface transition-colors">
          Business Overview
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(({ icon, value, label }) => (
          <StatCard01 key={label} icon={icon} value={value} label={label} />
        ))}
      </div>

      {/* Actions */}
      <p className="text-sm font-semibold text-text-default mb-3">Actions</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {ACTIONS.map(({ icon, label, sub, href }) => (
          <Link key={label} href={href}>
            <StatCard01 icon={icon} value={label} label={sub} textSize="text-sm" textSize2="text-xs" />
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <p className="text-sm font-semibold text-text-default mb-3">Recent activity</p>
      <div className="bg-bg-surface rounded-2xl px-4 overflow-hidden">
        {loading ? (
          <p className="text-text-muted text-sm text-center py-6">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">No recent activity</p>
        ) : activity.slice(0, 5).map((item: any, i: number) => (
          <TransactionItem
            key={item.id ?? i}
            icon={<ArrowleftdownIcon />}
            title={item.action ?? 'Activity'}
            subtitle={new Date(item.occurredOnUtc).toLocaleString()}
            amount={item.detail ?? ''}
            showDivider={i < Math.min(activity.length, 5) - 1}
          />
        ))}
        <Link href="/sales" className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-brand border-t border-[#9B9EA31A] mt-1">
          View all <ArrowRightIcon width={16} />
        </Link>
      </div>
    </div>
  );
}
