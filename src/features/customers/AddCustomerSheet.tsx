'use client';

import { useEffect, useState } from 'react';
import { X, ArrowRight, ArrowLeft, Search, Check, Phone } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { customersApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr, cn } from '@/src/lib/utils';

type Step = 'details' | 'link' | 'review' | 'success';

interface CustomerForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  category: 'Retail' | 'Wholesale';
  address: string;
  notes: string;
}

const EMPTY_FORM: CustomerForm = {
  fullName: '',
  phoneNumber: '',
  email: '',
  category: 'Retail',
  address: '',
  notes: '',
};

// ── Step Progress Bar ──────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ['details', 'link', 'review'];
  const labels = ['Customer Details', 'Link Account', 'Review Details'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="px-6 pb-5">
      {/* Track */}
      <div className="flex items-center mb-2">
        {steps.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s} className="flex items-center flex-1">
              {/* Connector before */}
              {i > 0 && (
                <div className={cn('flex-1 h-0.5', i <= currentIdx ? 'bg-emerald-500' : 'bg-gray-200')} />
              )}
              {/* Dot */}
              <div className={cn(
                'shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
                active ? 'w-6 h-6 border-emerald-500 bg-white' : done ? 'w-2.5 h-2.5 border-emerald-500 bg-white' : 'w-2.5 h-2.5 border-gray-300 bg-white'
              )}>
                {active && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              {/* Connector after (for last step only) */}
              {i < steps.length - 1 && i === currentIdx - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <p key={label} className={cn('text-[10px] font-medium', i <= currentIdx ? 'text-emerald-600' : 'text-gray-400', i === 0 ? 'text-left' : i === 2 ? 'text-right' : 'text-center', 'flex-1')}>
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddCustomerSheet({ open, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkedAccount, setLinkedAccount] = useState<{ name: string; vintranId: string } | null>(null);
  const [linkSearchDone, setLinkSearchDone] = useState(false);
  const [searching, setSearching] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    locationsApi.list().then((res: any) => {
      const locs = toArr(res.data).filter((l: any) => l.kind === 'Store' || l.kind === 'Both');
      setStores(locs);
      if (locs.length > 0) setStoreId(locs[0].id);
    }).catch(() => {});
  }, [open]);

  const reset = () => {
    setStep('details');
    setForm(EMPTY_FORM);
    setLinkSearch('');
    setLinkedAccount(null);
    setLinkSearchDone(false);
  };

  const canContinueDetails = form.fullName.trim() && form.phoneNumber.trim() && form.category;

  const handleLinkSearch = async () => {
    if (!linkSearch.trim()) return;
    setSearching(true);
    // Search the business directory for a matching Vintran account
    try {
      const { businessApi } = await import('@/src/lib/api/auth');
      const res: any = await businessApi.searchDirectory({ search: linkSearch.trim(), limit: 1 });
      const items = toArr(res.data);
      if (items.length > 0) {
        setLinkedAccount({ name: items[0].businessName ?? items[0].name, vintranId: items[0].businessId ?? items[0].id });
      } else {
        setLinkedAccount(null);
      }
    } catch {
      setLinkedAccount(null);
    } finally {
      setSearching(false);
      setLinkSearchDone(true);
    }
  };

  const handleSave = async () => {
    if (!storeId) { toast.error('No store found — create a store first'); return; }
    setSaving(true);
    const parts = form.fullName.trim().split(' ');
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || '-';
    try {
      await customersApi.create({
        firstName,
        lastName,
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
        category: form.category,
      }, storeId);
      setStep('success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const summaryRows = [
    { label: 'Customer Name', value: form.fullName },
    { label: 'Phone Number', value: form.phoneNumber },
    { label: 'Email', value: form.email || '—' },
    { label: 'Category', value: form.category },
    { label: 'Address', value: form.address || '—' },
    { label: 'Notes', value: form.notes || '—' },
    ...(linkedAccount ? [{ label: 'Vintran ID', value: linkedAccount.vintranId }] : []),
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm" />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-xl flex flex-col max-h-[95vh] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[480px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none sm:max-h-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            {step !== 'details' && step !== 'success' && (
              <button type="button" onClick={() => setStep(step === 'link' ? 'details' : 'link')} className="p-1 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={18} className="text-text-default" />
              </button>
            )}
            <h3 className="text-base font-bold text-[#0A0D14]">
              {step === 'success' ? 'Customer Added!' : 'Add Customer'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Step bar — hidden on success */}
        {step !== 'success' && <StepBar step={step} />}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <SuccessScreen
              standalone={false}
              title={`${form.fullName} added successfully`}
              subtitle="The customer has been added to your records."
              primaryAction={
                <Button fullWidth size="lg" onClick={() => { reset(); onSaved(); }}>
                  Done
                </Button>
              }
              secondaryAction={
                <Button variant="secondary" fullWidth size="lg" onClick={() => { reset(); }}>
                  Add another customer
                </Button>
              }
            />
          )}

          {/* ── STEP 1: DETAILS ── */}
          {step === 'details' && (
            <div className="space-y-3">
              <p className="text-base font-bold text-[#0A0D14] mb-1">Enter Customer Details</p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Full Name *</label>
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Enter full name" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Phone Number *</label>
                <div className="flex items-center h-11 rounded-[10px] border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 shrink-0">
                    <span className="text-sm">🇳🇬</span>
                    <span className="text-xs text-text-muted">+234</span>
                  </div>
                  <input type="tel" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="000 000 0000" className="flex-1 h-full px-3 text-sm focus:outline-none bg-transparent" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Email <span className="font-normal text-text-muted">(optional)</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="customer@email.com" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Customer Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white">
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Address <span className="font-normal text-text-muted">(optional)</span></label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter full address" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Notes <span className="font-normal text-text-muted">(optional)</span></label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this customer…" rows={3} maxLength={250} className="w-full rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none resize-none" />
                <p className="text-[10px] text-text-muted text-right">{form.notes.length}/250</p>
              </div>

              {stores.length > 1 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0A0D14]">Store *</label>
                  <select value={storeId} onChange={e => setStoreId(e.target.value)} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white">
                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: LINK ACCOUNT ── */}
          {step === 'link' && (
            <div className="space-y-4">
              <div>
                <p className="text-base font-bold text-[#0A0D14]">
                  Link Vintran Account{' '}
                  <span className="text-sm font-normal text-text-muted">(optional)</span>
                </p>
              </div>

              <div className="flex items-start gap-3 bg-brand-lighter rounded-xl px-4 py-3.5">
                <span className="text-brand text-base mt-0.5">ℹ</span>
                <p className="text-sm font-medium text-brand leading-relaxed">
                  Linking a Vintran account helps you track payments and transactions easily.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0A0D14]">Enter Email or Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center h-11 bg-[#F8FAFC] rounded-[10px] border border-gray-200 px-3 gap-2">
                    <Search size={15} className="text-[#94A3B8] shrink-0" />
                    <input
                      value={linkSearch}
                      onChange={e => { setLinkSearch(e.target.value); setLinkSearchDone(false); setLinkedAccount(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleLinkSearch()}
                      placeholder="bjaco@gmail.com or 080..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
                    />
                    {linkSearch && <button type="button" onClick={() => { setLinkSearch(''); setLinkSearchDone(false); setLinkedAccount(null); }} className="text-text-muted hover:text-text-default"><X size={14} /></button>}
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkSearch}
                    disabled={!linkSearch.trim() || searching}
                    className="h-11 px-4 rounded-[10px] bg-brand text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {searching ? '…' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Search result */}
              {linkSearchDone && (
                <div className={cn('rounded-xl border p-4', linkedAccount ? 'border-[#DBEAFE] bg-[#F0F7FF]' : 'border-red-200 bg-red-50')}>
                  {linkedAccount ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Check size={16} className="text-brand" />
                        <p className="text-sm font-bold text-brand">Account Found</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-brand font-bold text-sm shrink-0">
                          {linkedAccount.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0A0D14]">{linkedAccount.name}</p>
                          <p className="text-xs text-text-muted">Vintran ID: {linkedAccount.vintranId}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-red-600">No account found for this email/phone.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-xl font-bold text-[#0A0D14]">{form.fullName}</p>
                {linkedAccount && (
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Check size={14} className="text-brand" />
                    <p className="text-xs font-medium text-brand">Verified Vintran Account</p>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-[#0A0D14]">Customer Summary</p>
                </div>
                {summaryRows.map((row, idx) => (
                  <div key={row.label} className={cn('flex justify-between items-start px-4 py-3', idx < summaryRows.length - 1 && 'border-b border-gray-100')}>
                    <p className="text-xs text-text-muted flex-1">{row.label}</p>
                    <p className="text-xs font-semibold text-[#0A0D14] flex-1 text-right">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step !== 'success' && (
          <div className={cn('px-6 pb-8 pt-4 border-t border-gray-100 shrink-0', step === 'review' ? 'space-y-2' : '')}>
            {step === 'details' && (
              <button
                type="button"
                disabled={!canContinueDetails}
                onClick={() => setStep('link')}
                className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
            {step === 'link' && (
              <div className="space-y-2">
                <button type="button" onClick={() => setStep('review')} className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
                <button type="button" onClick={() => setStep('review')} className="w-full h-12 rounded-xl border border-gray-200 text-brand font-semibold text-sm">
                  Skip »
                </button>
              </div>
            )}
            {step === 'review' && (
              <div className="space-y-2">
                <button type="button" onClick={() => setStep('details')} className="w-full h-12 rounded-xl border border-gray-200 text-[#0A0D14] font-semibold text-sm">
                  ✎ Edit
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Customer'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
