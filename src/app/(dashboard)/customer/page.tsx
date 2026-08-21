'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { customersApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { fmt, initials } from '@/src/features/customers/utils';
import { AddCustomerSheet } from '@/src/features/customers/AddCustomerSheet';
import { CustomerProfile } from '@/src/features/customers/CustomerProfile';
import { DebtTab } from '@/src/features/customers/DebtTab';
import { CreditTab } from '@/src/features/customers/CreditTab';
import { BenefitsTab } from '@/src/features/customers/BenefitsTab';
import { BulkUploadCustomers } from './components/BulkUploadCustomers';

type MainTab = 'Customers' | 'Bulk Import' | 'Debt' | 'Credit' | 'Benefits';

export default function CustomerPage() {
  const [mainTab, setMainTab] = useState<MainTab>('Customers');
  const [subFilter, setSubFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionCustomer, setActionCustomer] = useState<any | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    customersApi.list({
      search: search || undefined,
      status: subFilter === 'active' ? 'Active' : subFilter === 'inactive' ? 'Inactive' : undefined,
      pageSize: 50,
    })
      .then((res: any) => setCustomers(toArr(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    customersApi.getStats()
      .then((res: any) => setStats(res.data ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, subFilter]);

  const deactivate = async (id: string) => {
    try {
      await customersApi.deactivate(id);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: 'Inactive' } : c));
      toast.success('Customer deactivated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed');
    }
    setActionCustomer(null);
  };

  // Profile sub-screen
  if (selectedId) {
    return (
      <div className="pb-16">
        <CustomerProfile customerId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  const TABS: MainTab[] = ['Customers', 'Bulk Import', 'Debt', 'Credit', 'Benefits'];

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-default">Customer Management</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-0">
        {TABS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t)}
            className={cn(
              'pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              mainTab === t ? 'text-[#0A0D14] border-brand' : 'text-text-helper border-transparent hover:text-text-subtle'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {mainTab === 'Bulk Import' && <BulkUploadCustomers />}
      {mainTab === 'Debt' && <DebtTab />}
      {mainTab === 'Credit' && <CreditTab />}
      {mainTab === 'Benefits' && <BenefitsTab />}

      {mainTab === 'Customers' && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Customers', value: stats?.total ?? 0 },
              { label: 'Active', value: stats?.active ?? 0 },
              { label: 'Total Sales', value: fmt(stats?.totalSales) },
              { label: 'New Customers', value: stats?.new ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
                <p className="text-xl font-bold text-text-default mb-0.5">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Add CTA */}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="w-full h-12 rounded-xl bg-brand-lighter border-2 border-brand/20 text-brand text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add New Customer
          </button>

          {/* Search */}
          <div className="flex items-center h-11 bg-[#F8FAFC] rounded-full px-4 gap-3 border border-gray-100">
            <Search size={16} className="text-[#94A3B8] shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setSubFilter(key)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize',
                  subFilter === key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {/* List header */}
          <p className="text-sm font-bold text-[#0A0D14]">My Customers ({customers.length})</p>

          {/* Customer list */}
          {loading ? (
            <p className="text-sm text-text-muted text-center py-8">Loading…</p>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">No customers found</p>
            </div>
          ) : (
            <div className="bg-bg-surface rounded-xl overflow-visible">
              {customers.map((c: any, idx: number) => (
                <div
                  key={c.id}
                  className={cn('flex items-center gap-3 px-4 py-3', idx < customers.length - 1 && 'border-b border-[#9B9EA34D]')}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-sm shrink-0">
                      {initials(c.firstName, c.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-default truncate">
                          {c.companyName || `${c.firstName} ${c.lastName}`}
                        </p>
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                          c.status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-[#DBEAFE] text-brand'
                        )}>
                          {c.status ?? 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{c.phoneNumber}</p>
                    </div>
                    <div className="text-right shrink-0 pr-2">
                      {(c.outstandingDebt ?? 0) > 0 ? (
                        <p className="text-xs font-semibold text-red-500">Owes {fmt(c.outstandingDebt)}</p>
                      ) : (
                        <p className="text-xs text-text-muted">🔗 {c.loyaltyPoints ?? 0}</p>
                      )}
                      {c.loyaltyTier && <p className="text-[10px] text-text-muted">{c.loyaltyTier}</p>}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionCustomer(c)}
                    className="p-1 rounded-full hover:bg-gray-100 text-text-muted shrink-0"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Customer Sheet */}
      <AddCustomerSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => { setShowAdd(false); fetchCustomers(); }}
      />

      {/* 3-dot action sheet */}
      {actionCustomer && (
        <>
          <div onClick={() => setActionCustomer(null)} className="fixed inset-0 z-40 bg-black/25" />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[380px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none">
            <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />
            <p className="text-base font-bold text-[#0A0D14] mb-4">
              {actionCustomer.companyName || `${actionCustomer.firstName} ${actionCustomer.lastName}`}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setSelectedId(actionCustomer.id); setActionCustomer(null); }}
                className="w-full flex items-center gap-3 bg-[#F8FAFC] px-4 py-3.5 rounded-xl text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg">👤</span>
                <p className="text-sm font-medium text-text-default">View Customer Profile</p>
              </button>
              <button
                type="button"
                onClick={() => { setMainTab('Benefits'); setActionCustomer(null); }}
                className="w-full flex items-center gap-3 bg-[#F8FAFC] px-4 py-3.5 rounded-xl text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg">🎁</span>
                <p className="text-sm font-medium text-text-default">Give Benefits</p>
              </button>
              <button
                type="button"
                onClick={() => deactivate(actionCustomer.id)}
                className="w-full flex items-center gap-3 bg-red-50 px-4 py-3.5 rounded-xl text-left hover:bg-red-100 transition-colors"
              >
                <span className="text-lg">🚫</span>
                <p className="text-sm font-medium text-red-600">Deactivate Customer</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
