'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import {
  ArrowRightIcon,
  ArrowdownIcon,
  BuildingIcon,
  DashSquareIcon,
  SideAvatarIcon,
  SideCustomersIcon,
  SideDevelopersIcon,
  SideGiftIcon,
  SideHelpIcon,
  SideHomeIcon,
  SideInsightsIcon,
  SideNumbersIcon,
  SideProductIcon,
  SideRcsIcon,
  SideSalesIcon,
  SideSettingsIcon,
  SideVerificationIcon,
  SideWalletIcon,
  SideWarehouseIcon,
} from '@/src/assets/icon';

const MAIN_NAV = [
  { label: 'Home', href: '/home/dashboard', Icon: SideHomeIcon },
  { label: 'Products', href: '/product', Icon: SideProductIcon, hasArrow: true },
  { label: 'Sales', href: '/sales', Icon: SideSalesIcon, hasArrow: true },
  { label: 'Customers', href: '/customer', Icon: SideCustomersIcon, hasArrow: true },
  { label: 'Warehouse management', href: '/warehouse-management', Icon: SideWarehouseIcon, hasArrow: true },
  { label: 'RCS', href: '/rcs', Icon: SideRcsIcon, hasArrow: true },
];

const OPERATIONS_NAV = [
  { label: 'Verification', href: '/verification', Icon: SideVerificationIcon, hasArrow: true },
  { label: 'Numbers', href: '/numbers', Icon: SideNumbersIcon, hasArrow: true },
  { label: 'Wallet', href: '/wallet', Icon: SideWalletIcon, hasArrow: true },
  { label: 'Insights', href: '/insights', Icon: SideInsightsIcon, hasArrow: true },
];

const SUPPORTS_NAV = [
  { label: 'Developers', href: '/developers', Icon: SideDevelopersIcon },
  { label: 'Settings', href: '/settings', Icon: SideSettingsIcon },
  { label: 'Help Center', href: '/help-center', Icon: SideHelpIcon, badge: '⌘I' },
];

function NavItem({
  label,
  href,
  Icon,
  hasArrow,
  badge,
  isActive,
}: {
  label: string;
  href: string;
  Icon: React.FC<{ width?: number; className?: string }>;
  hasArrow?: boolean;
  badge?: string;
  isActive?: boolean;
}) {
  const content = (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group',
        isActive
          ? 'bg-primary-alpha-10 text-brand'
          : 'text-text-subtle hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          width={18}
          className={cn(isActive ? 'text-brand' : 'text-text-helper')}
        />
        <span
          className={cn(
            'text-sm font-medium leading-none',
            isActive ? 'text-brand font-semibold' : 'text-text-subtle'
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {badge && (
          <span className="text-[10px] font-medium bg-brand text-white px-1.5 py-0.5 rounded-md">
            {badge}
          </span>
        )}
        {hasArrow && (
          <ArrowRightIcon
            width={16}
            className={cn(
              isActive ? 'text-brand' : 'text-text-muted'
            )}
          />
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[270px] min-w-[270px] h-screen border-r border-gray-200 overflow-hidden bg-white">
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <DashSquareIcon width={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-default leading-none">Vintran Inventory</p>
            <p className="text-[10px] text-text-muted mt-0.5">Inventory</p>
          </div>
        </div>
        <button type="button" className="text-text-muted hover:text-text-default">
          <BuildingIcon width={18} />
        </button>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Main nav */}
        {MAIN_NAV.map((item) => (
          <NavItem
            key={item.label + item.href}
            {...item}
            isActive={pathname.startsWith(item.href) && item.href !== ''}
          />
        ))}

        {/* Operations section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Operations
          </p>
        </div>
        {OPERATIONS_NAV.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isActive={pathname.startsWith(item.href) && item.href !== ''}
          />
        ))}

        {/* Supports section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Supports
          </p>
        </div>
        {SUPPORTS_NAV.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isActive={pathname.startsWith(item.href ?? '') && !!item.href}
          />
        ))}
      </nav>

      {/* CTA banner */}
      <div className="mx-3 mb-3 rounded-xl bg-brand p-3 text-white">
        <div className="flex items-center gap-2 mb-1">
          <SideGiftIcon width={16} className="text-white" />
          <p className="text-xs font-bold">Claim your free trial!</p>
        </div>
        <p className="text-[10px] leading-relaxed opacity-90">
          Claim your free trial and explore the features.
        </p>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SideAvatarIcon width={32} className="rounded-full" />
            <div>
              <p className="text-xs font-semibold text-text-default leading-none">Jorge Rivera-Herrans</p>
              <p className="text-[10px] text-text-muted mt-0.5">Admin</p>
            </div>
          </div>
          <ArrowRightIcon width={16} className="text-text-muted" />
        </div>
      </div>
    </aside>
  );
}
