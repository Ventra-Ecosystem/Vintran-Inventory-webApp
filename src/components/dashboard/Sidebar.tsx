'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import {
  ArrowRightIcon,
  DashSquareIcon,
  SideAvatarIcon,
  SideGiftIcon,
  SideHomeIcon,
  SideProductIcon,
  SideSalesIcon,
  SideCustomersIcon,
  SideWarehouseIcon,
  SideSettingsIcon,
  SideHelpIcon,
  SideMarketplaceIcon,
  SideFinanceIcon,
  SideReportsIcon,
  SideStaffIcon,
  SideInvoiceIcon,
  SideSuppliersIcon,
  SwitchIcon,
  SupportIcon,
  BuildingIcon,
} from '@/src/assets/icon';
import { X, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { useMe } from '@/src/hooks/useMe';

// ─── Nav item definitions — mirrors mobile DrawerMenu navItems exactly ────────

const NAV_ITEMS = [
  { label: 'Home',                    href: '/dashboard',            Icon: SideHomeIcon },
  { label: 'Store & Sales',           href: '/sales',                Icon: SideSalesIcon },
  { label: 'Marketplace & Storefront',href: '/marketplace',          Icon: SideMarketplaceIcon },
  { label: 'Warehouse Management',    href: '/warehouse-management', Icon: SideWarehouseIcon },
  { label: 'Product Management',      href: '/product',              Icon: SideProductIcon },
  { label: 'Supplier Management',     href: '/suppliers',            Icon: SideSuppliersIcon },
  { label: 'Money In & Money Out',    href: '/finance',              Icon: SideFinanceIcon },
  { label: 'Customers & Debts',       href: '/customer',             Icon: SideCustomersIcon },
  { label: 'Staff Management',        href: '/settings/staff',       Icon: SideStaffIcon },
  { label: 'Business Report',         href: '/reports',              Icon: SideReportsIcon },
  { label: 'Invoice',                 href: null,                    Icon: SideInvoiceIcon, comingSoon: true },
] as const;

// ─── NavItem component ─────────────────────────────────────────────────────────

type IconComponent = React.FC<{ width?: number; className?: string }>;

function NavItem({
  label,
  href,
  Icon,
  isActive,
  isCollapsed,
  comingSoon,
  onClick,
}: {
  label: string;
  href: string | null;
  Icon: IconComponent;
  isActive?: boolean;
  isCollapsed?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <div
      className={cn(
        'flex items-center rounded-xl cursor-pointer group transition-all duration-150',
        isCollapsed
          ? 'justify-center p-2.5 mx-auto w-10 h-10'
          : 'justify-between px-3 py-2.5',
        isActive
          ? 'bg-primary-alpha-10 text-brand'
          : comingSoon
          ? 'text-text-muted opacity-60 cursor-not-allowed'
          : 'text-text-subtle hover:bg-gray-50'
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3 min-w-0')}>
        <Icon
          width={18}
          className={cn('shrink-0', isActive ? 'text-brand' : 'text-text-helper')}
        />
        {!isCollapsed && (
          <span
            className={cn(
              'text-sm font-medium leading-none truncate',
              isActive ? 'text-brand font-semibold' : 'text-text-subtle'
            )}
          >
            {label}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {comingSoon && (
            <span className="text-[9px] font-semibold tracking-wide bg-gray-100 text-text-muted px-1.5 py-0.5 rounded-md uppercase">
              Soon
            </span>
          )}
          {!comingSoon && (
            <ArrowRightIcon
              width={14}
              className={cn(isActive ? 'text-brand' : 'text-text-muted')}
            />
          )}
        </div>
      )}
    </div>
  );

  if (!href || comingSoon) {
    return <div onClick={!comingSoon ? onClick : undefined}>{inner}</div>;
  }
  return (
    <Link href={href} onClick={onClick}>
      {inner}
    </Link>
  );
}

// ─── Utility item (Switch User, Contact Support) ──────────────────────────────

function UtilityItem({
  Icon,
  label,
  isCollapsed,
  onClick,
}: {
  Icon: IconComponent;
  label: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center rounded-xl transition-all duration-150 hover:bg-gray-50 text-text-subtle',
        isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'justify-between px-3 py-2.5'
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
        <Icon width={18} className="text-text-helper shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium text-text-subtle">{label}</span>
        )}
      </div>
      {!isCollapsed && (
        <ChevronRight size={14} className="text-text-muted shrink-0" />
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  isCollapsed,
  onClose,
}: {
  isCollapsed?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  useMe();
  const { firstName, lastName, isOwner, businessName } = useAuthStore();

  const displayName = firstName ? `${firstName} ${lastName ?? ''}`.trim() : 'User';
  const displayRole = isOwner ? 'Business Owner' : 'Staff';

  return (
    <aside className="flex flex-col w-full h-full border-r border-gray-100 overflow-hidden bg-white">

      {/* ── Brand / Business Header ── */}
      <div
        className={cn(
          'border-b border-gray-100 py-4 h-[73px] flex items-center',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand flex shrink-0 items-center justify-center">
            <DashSquareIcon width={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-default leading-none truncate">
                {businessName ?? 'My Business'}
              </p>
              <button
                type="button"
                className="flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
              >
                Switch / Create Business
                <ChevronRight size={10} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isCollapsed && (
            <button
              type="button"
              className="text-text-muted hover:text-text-default p-1 rounded-lg hover:bg-gray-100 hidden lg:block"
              title="Business settings"
            >
              <BuildingIcon width={16} />
            </button>
          )}
          {/* Mobile close */}
          <button
            type="button"
            className="lg:hidden text-text-muted p-1 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5">

        {/* Main nav items — matches mobile DrawerMenu exactly */}
        {NAV_ITEMS.map((item) => {
          const isActive = item.href
            ? pathname === item.href || pathname.startsWith(item.href + '/')
            : false;
          return (
            <NavItem
              key={item.label}
              label={item.label}
              href={item.href as string | null}
              Icon={item.Icon as IconComponent}
              isActive={isActive}
              isCollapsed={isCollapsed}
              comingSoon={'comingSoon' in item ? item.comingSoon : false}
              onClick={onClose}
            />
          );
        })}

        {/* Divider — matches mobile separator */}
        <div className={cn('my-2', isCollapsed ? 'flex justify-center' : 'px-3')}>
          <div className={cn('h-px bg-gray-100', isCollapsed ? 'w-6' : 'w-full')} />
        </div>

        {/* Switch User */}
        <UtilityItem
          Icon={SwitchIcon}
          label="Switch User"
          isCollapsed={isCollapsed}
          onClick={onClose}
        />

        {/* Contact Support */}
        <UtilityItem
          Icon={SupportIcon}
          label="Contact Support"
          isCollapsed={isCollapsed}
          onClick={onClose}
        />

        {/* Help Center */}
        <UtilityItem
          Icon={SideHelpIcon}
          label="Help Center"
          isCollapsed={isCollapsed}
          onClick={onClose}
        />
      </nav>

      {/* ── CTA banner ── */}
      {!isCollapsed ? (
        <div className="mx-3 mb-3 rounded-xl bg-brand p-3 text-white shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <SideGiftIcon width={16} className="text-white" />
            <p className="text-xs font-bold whitespace-nowrap">Claim your free trial!</p>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Claim your free trial and explore all features.
          </p>
        </div>
      ) : (
        <div
          className="mx-auto mb-3 flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white shrink-0"
          title="Claim your free trial!"
        >
          <SideGiftIcon width={16} className="text-white" />
        </div>
      )}

      {/* ── User footer — mirrors mobile bottom card ── */}
      <div
        className={cn(
          'border-t border-gray-100 pt-3 pb-4 shrink-0',
          isCollapsed ? 'px-2' : 'px-3'
        )}
      >
        <div
          className={cn(
            'flex items-center bg-[#F8FAFC] rounded-xl px-3 py-3',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <SideAvatarIcon width={32} className="rounded-full shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-default leading-none truncate w-[120px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">{displayRole}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-gray-200 text-text-muted transition-colors cursor-pointer shrink-0"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
