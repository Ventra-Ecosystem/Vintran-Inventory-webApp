'use client';

import { useEffect, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { customersApi, financeApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn, toArr } from '@/src/lib/utils';
import { initials } from './utils';
import { Button } from '@/src/components/ui/Button';

export function CreditTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      customersApi.list({ search: search || undefined, pageSize: 20 })
        .then((res: any) => setCustomers(toArr(res.data)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !amount || !reason) { toast.error('All fields required'); return; }
    setIssuing(true);
    try {
      await financeApi.issueCredit({ customerId: selected.id, amount: Number(amount), reason, method: 'InAppCreditBalance' });
      setDone(true);
    } catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
    finally { setIssuing(false); }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <Check size={28} className="text-emerald-600" />
        </div>
        <p className="text-base font-bold text-text-default">Credit Issued!</p>
        <p className="text-sm text-text-muted">
          ₦{Number(amount).toLocaleString()} credit added to {selected?.firstName} {selected?.lastName}
        </p>
        <Button size="lg" onClick={() => { setDone(false); setSelected(null); setAmount(''); setReason(''); }}>
          Issue another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-text-default">Issue Credit to Customer</p>

      {!selected && (
        <>
          <div className="flex items-center h-11 bg-[#F8FAFC] rounded-full px-4 gap-3 border border-gray-200">
            <Search size={16} className="text-[#94A3B8] shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]" />
          </div>
          {customers.length > 0 && (
            <div className="bg-bg-surface rounded-xl overflow-hidden">
              {customers.slice(0, 6).map((c: any, idx: number) => (
                <button key={c.id} type="button" onClick={() => setSelected(c)} className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left', idx < customers.length - 1 && 'border-b border-[#9B9EA34D]')}>
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
            <p className="text-sm text-text-muted text-center py-6">Search for a customer to issue credit</p>
          )}
        </>
      )}

      {selected && (
        <form onSubmit={handleIssue} className="space-y-3">
          <div className="flex items-center justify-between bg-brand-lighter rounded-xl px-4 py-2.5">
            <p className="text-sm font-semibold text-brand">{selected.firstName} {selected.lastName}</p>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-brand">Change</button>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Credit Amount (₦) *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Reason *</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Loyalty reward, refund credit…" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <Button type="submit" fullWidth size="lg" disabled={issuing || !amount || !reason}>
            {issuing ? 'Issuing…' : 'Issue Credit'}
          </Button>
        </form>
      )}
    </div>
  );
}
