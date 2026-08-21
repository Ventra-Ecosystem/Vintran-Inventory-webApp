'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Check } from 'lucide-react';
import { customersApi, financeApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { fmt, initials, fmtDate } from './utils';

type ProfileTab = 'Overview' | 'Purchase History' | 'Benefits' | 'Contact';

interface Props {
  customerId: string;
  onBack: () => void;
}

export function CustomerProfile({ customerId, onBack }: Props) {
  const [profileTab, setProfileTab] = useState<ProfileTab>('Overview');
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      customersApi.get(customerId),
      customersApi.getSales(customerId, { pageSize: 50 }),
      financeApi.getOpenDebts({ customerId }),
    ]).then(([custRes, salesRes, debtRes]: any[]) => {
      setCustomer(custRes.data ?? null);
      setSales(toArr(salesRes.data));
      setDebts(toArr(debtRes.data));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [customerId]);

  const repayDebt = async (debtId: string, amount: number) => {
    try {
      await financeApi.repayDebt(debtId, amount);
      setDebts(prev => prev.filter(d => d.id !== debtId));
      toast.success('Debt marked as repaid');
    } catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
  };

  if (loading) return <div className="text-center py-16 text-text-muted text-sm">Loading…</div>;
  if (!customer) return <div className="text-center py-16 text-text-muted text-sm">Customer not found</div>;

  const name = customer.companyName || `${customer.firstName} ${customer.lastName}`;
  const activeBenefits: any[] = customer.activeBenefits ?? [];
  const claimedBenefits: any[] = customer.claimedBenefits ?? [];

  return (
    <div className="space-y-4 pb-16">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-brand">
        <ArrowLeft size={16} /> Back to customers
      </button>

      {/* Header card */}
      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-lg shrink-0">
              {initials(customer.firstName, customer.lastName)}
            </div>
            <div>
              <p className="text-base font-bold text-[#0A0D14]">{name}</p>
              <p className="text-xs text-text-muted">{customer.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-brand-lighter px-3 py-1 rounded-full">
            <span className="text-xs text-brand">🔗 {customer.loyaltyPoints ?? 0} pts</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', customer.status === 'Inactive' ? 'bg-gray-100 text-gray-500' : 'bg-[#DBEAFE] text-brand')}>
            {customer.status ?? 'Active'}
          </span>
          {customer.phoneNumber && (
            <a href={`tel:${customer.phoneNumber}`} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand text-white text-xs font-semibold">
              <Phone size={13} /> Call
            </a>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {(['Overview', 'Purchase History', 'Benefits', 'Contact'] as ProfileTab[]).map(t => (
          <button key={t} type="button" onClick={() => setProfileTab(t)} className={cn('pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors', profileTab === t ? 'text-[#0A0D14] border-brand' : 'text-text-helper border-transparent hover:text-text-subtle')}>
            {t === 'Benefits' ? `Benefits (${activeBenefits.length})` : t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {profileTab === 'Overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total orders', value: String(customer.purchaseCount ?? 0), cls: 'text-text-default' },
              { label: 'Spend value', value: fmt(customer.purchaseTotal), cls: 'text-emerald-600' },
              { label: 'Loyalty points', value: `${customer.loyaltyPoints ?? 0}`, cls: 'text-purple-600' },
              { label: 'Outstanding debt', value: fmt(customer.outstandingDebt), cls: 'text-red-500' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
                <p className={cn('text-xl font-bold mb-1', cls)}>{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {activeBenefits.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#0A0D14] mb-3">Active Benefits ({activeBenefits.length})</p>
              <div className="bg-bg-surface rounded-xl overflow-hidden">
                {activeBenefits.map((b: any, idx: number) => (
                  <div key={b.id ?? idx} className={cn('flex items-center justify-between px-4 py-3', idx < activeBenefits.length - 1 && 'border-b border-[#9B9EA34D]')}>
                    <div>
                      <p className="text-sm font-semibold text-text-default">{b.type?.replace(/([A-Z])/g, ' $1').trim() ?? '—'}</p>
                      {b.code && <p className="text-xs text-text-muted">{b.code}</p>}
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{b.status ?? 'Active'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debts.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#0A0D14] mb-3">Open Debts</p>
              <div className="bg-bg-surface rounded-xl overflow-hidden">
                {debts.map((d: any, idx: number) => (
                  <div key={d.id} className={cn('px-4 py-3 flex items-center justify-between', idx < debts.length - 1 && 'border-b border-[#9B9EA34D]')}>
                    <div>
                      <p className="text-xs font-semibold text-red-500">{fmt(d.amount ?? d.outstandingAmount)}</p>
                      <p className="text-[10px] text-text-muted">{d.narration ?? 'Debt'}</p>
                    </div>
                    <button type="button" onClick={() => repayDebt(d.id, d.amount ?? d.outstandingAmount)} className="text-xs font-semibold text-brand hover:underline">Mark Paid</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0A0D14]">Recent Sales</p>
              <button type="button" onClick={() => setProfileTab('Purchase History')} className="text-xs font-medium text-brand">View all</button>
            </div>
            {sales.length === 0 ? <p className="text-xs text-text-muted py-3">No sales yet</p> : (
              <div className="bg-bg-surface rounded-xl overflow-hidden">
                {sales.slice(0, 3).map((s: any, idx: number) => (
                  <div key={s.saleId ?? s.id ?? idx} className={cn('flex items-center justify-between px-4 py-3', idx < Math.min(sales.length, 3) - 1 && 'border-b border-[#9B9EA34D]')}>
                    <div>
                      <p className="text-sm font-semibold text-text-default">{s.number}</p>
                      <p className="text-xs text-text-muted">{s.channel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-default">{fmt(s.grandTotal)}</p>
                      <p className="text-xs text-text-muted">{s.createdOnUtc ? fmtDate(s.createdOnUtc) : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase History */}
      {profileTab === 'Purchase History' && (
        <div>
          <p className="text-sm font-bold text-[#0A0D14] mb-3">Purchase History ({sales.length})</p>
          {sales.length === 0 ? <p className="text-xs text-text-muted py-6 text-center">No purchases yet</p> : (
            <div className="bg-bg-surface rounded-xl overflow-hidden">
              {sales.map((s: any, idx: number) => (
                <div key={s.saleId ?? s.id ?? idx} className={cn('flex items-center justify-between px-4 py-3', idx < sales.length - 1 && 'border-b border-[#9B9EA34D]')}>
                  <div>
                    <p className="text-sm font-semibold text-text-default">{s.number} · {s.channel}</p>
                    <p className="text-xs text-text-muted">{s.createdOnUtc ? new Date(s.createdOnUtc).toLocaleString() : '—'}</p>
                  </div>
                  <p className="text-sm font-bold text-text-default">{fmt(s.grandTotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Benefits */}
      {profileTab === 'Benefits' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-[#0A0D14] mb-3">Active ({activeBenefits.length})</p>
            {activeBenefits.length === 0 ? <p className="text-xs text-text-muted">None</p> : (
              <div className="bg-bg-surface rounded-xl overflow-hidden">
                {activeBenefits.map((b: any, idx: number) => (
                  <div key={b.id ?? idx} className={cn('flex items-center justify-between px-4 py-3', idx < activeBenefits.length - 1 && 'border-b border-[#9B9EA34D]')}>
                    <div>
                      <p className="text-sm font-semibold text-text-default">{b.type?.replace(/([A-Z])/g, ' $1').trim()}</p>
                      {b.expiresOnUtc && <p className="text-[10px] text-text-muted">Exp: {fmtDate(b.expiresOnUtc)}</p>}
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-[#0A0D14] mb-3">Claimed ({claimedBenefits.length})</p>
            {claimedBenefits.length === 0 ? <p className="text-xs text-text-muted">None yet</p> : (
              <div className="bg-bg-surface rounded-xl overflow-hidden">
                {claimedBenefits.map((b: any, idx: number) => (
                  <div key={b.id ?? idx} className={cn('flex items-center justify-between px-4 py-3', idx < claimedBenefits.length - 1 && 'border-b border-[#9B9EA34D]')}>
                    <p className="text-sm text-text-default">{b.type?.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      {profileTab === 'Contact' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-bold text-[#0A0D14] mb-3">Contact Details</p>
            <div className="divide-y divide-gray-100">
              {[{ label: 'Phone', value: customer.phoneNumber }, { label: 'Email', value: customer.email ?? '—' }, { label: 'Address', value: customer.address ?? '—' }].map(r => (
                <div key={r.label} className="flex justify-between py-2.5">
                  <p className="text-xs text-text-muted">{r.label}</p>
                  <p className="text-xs font-semibold text-text-default text-right max-w-[60%]">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-bold text-[#0A0D14] mb-3">Performance</p>
            <div className="divide-y divide-gray-100">
              {[{ label: 'Total orders', value: String(customer.purchaseCount ?? 0) }, { label: 'Total spend', value: fmt(customer.purchaseTotal) }, { label: 'Outstanding debt', value: fmt(customer.outstandingDebt) }].map(r => (
                <div key={r.label} className="flex justify-between py-2.5">
                  <p className="text-xs text-text-muted">{r.label}</p>
                  <p className="text-xs font-semibold text-text-default">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
