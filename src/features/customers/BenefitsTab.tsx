'use client';

import { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { customersApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { initials } from './utils';
import { Button } from '@/src/components/ui/Button';

const BENEFIT_TYPES = [
  'ProductDiscount', 'MonetaryDiscount', 'Cashback', 'LoyaltyPoints',
  'FreeDelivery', 'BuyOneGetOne', 'CouponVoucher', 'CreditBonus',
];

export function BenefitsTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [existingBenefits, setExistingBenefits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [benefitType, setBenefitType] = useState('ProductDiscount');
  const [amount, setAmount] = useState('');
  const [pct, setPct] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      customersApi.list({ search: search || undefined, pageSize: 20 })
        .then((res: any) => setCustomers(toArr(res.data)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const selectCustomer = (c: any) => {
    setSelected(c);
    customersApi.getApplicableBenefits(c.id)
      .then((res: any) => setExistingBenefits(toArr(res.data)))
      .catch(() => setExistingBenefits([]));
  };

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await customersApi.addBenefit(selected.id, {
        type: benefitType,
        amountValue: amount ? Number(amount) : undefined,
        percentageValue: pct ? Number(pct) : undefined,
      });
      setDone(true);
    } catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
    finally { setSaving(false); }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-lighter flex items-center justify-center">
          <Star size={28} className="text-brand" />
        </div>
        <p className="text-base font-bold text-text-default">Benefit Added!</p>
        <p className="text-sm text-text-muted">Benefit applied to {selected?.firstName} {selected?.lastName}</p>
        <Button size="lg" onClick={() => { setDone(false); setSelected(null); setAmount(''); setPct(''); }}>
          Give another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-text-default">Give Benefit to Customer</p>

      {!selected && (
        <>
          <div className="flex items-center h-11 bg-[#F8FAFC] rounded-full px-4 gap-3 border border-gray-200">
            <Search size={16} className="text-[#94A3B8] shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]" />
          </div>
          {customers.length > 0 && (
            <div className="bg-bg-surface rounded-xl overflow-hidden">
              {customers.slice(0, 6).map((c: any, idx: number) => (
                <button key={c.id} type="button" onClick={() => selectCustomer(c)} className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left', idx < customers.length - 1 && 'border-b border-[#9B9EA34D]')}>
                  <div className="w-9 h-9 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-sm shrink-0">
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-default">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-text-muted">{c.phoneNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!search && customers.length === 0 && (
            <p className="text-sm text-text-muted text-center py-6">Search for a customer to give a benefit</p>
          )}
        </>
      )}

      {selected && (
        <form onSubmit={handleGive} className="space-y-3">
          <div className="flex items-center justify-between bg-brand-lighter rounded-xl px-4 py-2.5">
            <p className="text-sm font-semibold text-brand">{selected.firstName} {selected.lastName}</p>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-brand">Change</button>
          </div>
          {existingBenefits.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">Existing benefits ({existingBenefits.length})</p>
              <div className="flex flex-wrap gap-2">
                {existingBenefits.map((b: any, i: number) => (
                  <span key={i} className="text-[10px] font-medium bg-[#EFF5FF] text-brand px-2 py-1 rounded-full">
                    {b.type?.replace(/([A-Z])/g, ' $1').trim() ?? b.type}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Benefit Type</label>
            <select value={benefitType} onChange={e => setBenefitType(e.target.value)} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white">
              {BENEFIT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Amount (₦)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0A0D14]">Percentage (%)</label>
              <input type="number" value={pct} onChange={e => setPct(e.target.value)} placeholder="0" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={saving || (!amount && !pct)}>
            {saving ? 'Saving…' : 'Give Benefit'}
          </Button>
        </form>
      )}
    </div>
  );
}
