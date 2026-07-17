'use client';

import Link from 'next/link';
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

const STATS = [
  { icon: <MoneyIcon width={22} />, value: '₦26,383', label: "Today's Sales" },
  { icon: <PakageIcon width={22} />, value: '3 Items', label: 'Low Stock' },
  { icon: <StoreIcon width={22} />, value: '2', label: 'Stores' },
  { icon: <WareHouseIcon width={22} />, value: '₦4.2M', label: 'Stock Value' },
];

const ACTIONS = [
  { icon: <WareHouseIcon width={22} />, label: 'Warehouse Set up', sub: 'Set your warehouse', href: '/warehouse-management' },
  { icon: <PakageIcon width={22} />, label: 'Add product', sub: 'Add your first product', href: '/product' },
  { icon: <MoneyIcon width={22} />, label: 'Record Sales', sub: 'Record a sale', href: '/sales' },
];

const ACTIVITY = [
  { title: 'Sale #0042', sub: 'Apr 14, 2026 10:24 AM', amount: '₦392,000' },
  { title: 'Sale #0042', sub: 'Apr 14, 2026 10:24 AM', amount: '₦392,000' },
  { title: 'Sale #0042', sub: 'Apr 14, 2026 10:24 AM', amount: '₦392,000' },
];

export default function HomeDashboardPage() {
  return (
    <div className="w-full">
      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-4 py-1.5 rounded-full bg-brand text-white text-sm font-medium">Dashboard</span>
        <Link href="/home/overview" className="px-4 py-1.5 rounded-full text-sm font-medium text-text-subtle hover:bg-bg-surface transition-colors">
          Business Overview
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map(({ icon, value, label }) => (
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
        {ACTIVITY.map((item, i) => (
          <TransactionItem
            key={i}
            icon={<ArrowleftdownIcon />}
            title={item.title}
            subtitle={item.sub}
            amount={item.amount}
            showDivider={i < ACTIVITY.length - 1}
          />
        ))}
        {/* View all */}
        <Link
          href="/sales"
          className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-brand border-t border-[#9B9EA31A] mt-1"
        >
          View all <ArrowRightIcon width={16} />
        </Link>
      </div>
    </div>
  );
}
