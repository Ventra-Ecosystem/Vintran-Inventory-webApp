'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import {
  ArrowRightIcon,
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
  StoreIcon,
} from '@/src/assets/icon';
import { X } from 'lucide-react';

const MAIN_NAV = [
  { label: 'Dashboard', href: '/dashboard', Icon: SideHomeIcon },
  { label: 'Products', href: '/product', Icon: SideProductIcon, hasArrow: true },
  { label: 'Sales', href: '/sales', Icon: SideSalesIcon, hasArrow: true },
  { label: 'Customers', href: '/customer', Icon: SideCustomersIcon, hasArrow: true },
  { label: 'Suppliers', href: '/suppliers', Icon: StoreIcon, hasArrow: true },
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
  isCollapsed,
  onClick,
}: {
  label: string;
  href?: string;
  Icon: React.FC<{ width?: number; className?: string }>;
  hasArrow?: boolean;
  badge?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={cn(
        'flex items-center rounded-xl cursor-pointer group transition-all',
        isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'justify-between px-3 py-2.5',
        isActive
          ? 'bg-primary-alpha-10 text-brand'
          : 'text-text-subtle hover:bg-gray-50'
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
        <Icon
          width={18}
          className={cn(isActive ? 'text-brand' : 'text-text-helper', 'shrink-0')}
        />
        {!isCollapsed && (
          <span
            className={cn(
              'text-sm font-medium leading-none whitespace-nowrap',
              isActive ? 'text-brand font-semibold' : 'text-text-subtle'
            )}
          >
            {label}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <div className="flex items-center gap-1 shrink-0">
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
      )}
    </div>
  );

  if (!href) return <div onClick={onClick}>{content}</div>;
  return <Link href={href} onClick={onClick}>{content}</Link>;
}

export function Sidebar({
  isCollapsed,
  onClose,
}: {
  isCollapsed?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-full h-full border-r border-gray-200 overflow-hidden bg-white">
      {/* Brand header */}
      <div className={cn(
        "flex items-center border-b border-gray-100 py-4 h-[73px]", /* Fixed height to match layout header */
        isCollapsed ? "justify-center px-1" : "justify-between px-4"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex shrink-0 items-center justify-center">
            <DashSquareIcon width={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-bold text-text-default leading-none whitespace-nowrap">Vintran Inventory</p>
              <p className="text-[10px] text-text-muted mt-0.5 whitespace-nowrap">Inventory</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button type="button" className="text-text-muted hover:text-text-default shrink-0 hidden lg:block">
              <BuildingIcon width={18} />
            </button>
          )}
          {/* Mobile close button */}
          <button type="button" className="lg:hidden text-text-muted p-1" onClick={onClose}>
            <X width={20} />
          </button>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5">
        {/* Main nav */}
        {MAIN_NAV.map((item) => (
          <NavItem
            key={item.label + item.href}
            {...item}
            isActive={pathname.startsWith(item.href) && item.href !== ''}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
        ))}

        {/* Operations section */}
        <div className="pt-4 pb-1">
          {!isCollapsed ? (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Operations
            </p>
          ) : (
            <div className="w-full flex justify-center"><div className="w-4 h-px bg-gray-200"></div></div>
          )}
        </div>
        {OPERATIONS_NAV.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isActive={pathname.startsWith(item.href) && item.href !== ''}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
        ))}

        {/* Supports section */}
        <div className="pt-4 pb-1">
          {!isCollapsed ? (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Supports
            </p>
          ) : (
            <div className="w-full flex justify-center"><div className="w-4 h-px bg-gray-200"></div></div>
          )}
        </div>
        {SUPPORTS_NAV.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isActive={pathname.startsWith(item.href ?? '') && !!item.href}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* CTA banner */}
      {!isCollapsed ? (
        <div className="mx-3 mb-3 rounded-xl bg-brand p-3 text-white shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <SideGiftIcon width={16} className="text-white" />
            <p className="text-xs font-bold whitespace-nowrap">Claim your free trial!</p>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Claim your free trial and explore the features.
          </p>
        </div>
      ) : (
        <div className="mx-auto mb-3 flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white shrink-0" title="Claim your free trial!">
          <SideGiftIcon width={16} className="text-white" />
        </div>
      )}

      {/* User footer */}
      <div className={cn("pb-4 border-t border-gray-100 pt-3 shrink-0", isCollapsed ? "px-2" : "px-3")}>
        <div className={cn("flex items-center justify-between", isCollapsed && "justify-center")}>
          <div className="flex items-center gap-2">
            <SideAvatarIcon width={isCollapsed ? 32 : 32} className="rounded-full shrink-0" />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text-default leading-none truncate w-[130px]">Jorge Rivera-Herrans</p>
                <p className="text-[10px] text-text-muted mt-0.5">Admin</p>
              </div>
            )}
          </div>
          {!isCollapsed && <ArrowRightIcon width={16} className="text-text-muted shrink-0" />}
        </div>
      </div>
    </aside>
  );
}
