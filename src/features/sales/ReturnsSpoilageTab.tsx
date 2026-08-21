'use client';

import { useEffect, useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { cn, toArr } from '@/src/lib/utils';
import { stockApi, locationsApi, productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { StoreIcon, PakageIcon } from '@/src/assets/icon';

type SubPill = 'returns' | 'spoilage';

// ── Location picker panel ──────────────────────────────────────────────────

function LocationPanel({
  open,
  onClose,
  locations,
  selected,
  onSelect,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  locations: any[];
  selected: string | null;
  onSelect: (id: string) => void;
  subtitle?: string;
}) {
  return (
    <>
      <div onClick={onClose} className={cn('fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')} />
      <div className={cn('fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white shadow-xl rounded-l-3xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <div className="px-5 pb-8 flex-1 overflow-y-auto">
          <p className="text-base font-bold text-[#0A0D14] pt-3 mb-1">Choose Store</p>
          {subtitle && <p className="text-[13px] text-[#64748B] mb-4">{subtitle}</p>}
          {locations.map(loc => {
            const isSel = selected === loc.id;
            return (
              <button key={loc.id} type="button" onClick={() => onSelect(loc.id)} className={cn('w-full flex items-center gap-3 py-3 border border-[#E2E8F0] rounded-xl px-3.5 mb-2.5', isSel ? 'border-brand bg-[#EFF5FF]' : 'bg-[#F8FAFC]')}>
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0"><StoreIcon width={20} className="text-brand" /></div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[#0A0D14]">{loc.name}</p>
                  <p className="text-[11px] text-[#64748B]">{loc.kind}</p>
                </div>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', isSel ? 'border-brand' : 'border-[#CBD5E1]')}>
                  {isSel && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
              </button>
            );
          })}
          <Button fullWidth size="lg" disabled={!selected} onClick={onClose} className="mt-2">Continue</Button>
          <button type="button" onClick={onClose} className="w-full py-3 text-sm font-semibold text-brand text-center mt-2">Cancel</button>
        </div>
      </div>
    </>
  );
}

// ── Spoilage form ─────────────────────────────────────────────────────────────

function SpoilageForm({ locationId, locationName, onDone }: { locationId: string; locationName: string; onDone: () => void }) {
  const [productQuery, setProductQuery] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!productQuery || productId) return;
    const t = setTimeout(() => {
      productsApi.list({ search: productQuery }).then((res: any) => setProductResults(toArr(res.data))).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery, productId]);

  const handleSubmit = async () => {
    if (!productId) { toast.error('Select a product'); return; }
    if (quantity <= 0) { toast.error('Quantity must be greater than 0'); return; }
    if (!reason) { toast.error('Select a reason'); return; }
    setSubmitting(true);
    try {
      await stockApi.adjust({ productId, locationId, actualQuantity: 0, reason: `Spoilage: ${reason}${notes ? ` - ${notes}` : ''}`, notes });
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to report spoilage');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="py-8">
        <SuccessScreen
          standalone={false}
          title="Spoilage Reported!"
          subtitle={`${quantity} units of ${productName} reported as spoiled at ${locationName}.`}
          primaryAction={<Button fullWidth size="lg" onClick={onDone}>Done</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2 bg-[#EFF5FF] rounded-xl px-3.5 py-3">
        <StoreIcon width={18} className="text-brand shrink-0" />
        <p className="text-sm font-semibold text-[#0A0D14]">{locationName}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Product *</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={productQuery}
            onChange={(e) => { setProductQuery(e.target.value); setProductId(''); setProductName(''); }}
            placeholder="Search by name or SKU…"
            className="w-full h-11 pl-9 pr-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        {productResults.length > 0 && !productId && (
          <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {productResults.slice(0, 5).map((p: any) => (
              <button key={p.id} type="button" className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                onClick={() => { setProductId(p.id); setProductName(p.name); setProductQuery(p.name); setProductResults([]); }}>
                <span className="font-medium">{p.name}</span>
                {p.sku && <span className="text-gray-400 ml-2 text-xs">{p.sku}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <QuantityStepper label="Quantity lost *" value={quantity} onChange={setQuantity} />

      <div>
        <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Reason *</p>
        <Dropdown
          value={reason}
          onChange={setReason}
          placeholder="Select reason"
          options={[
            { label: 'Expired', value: 'Expired' },
            { label: 'Damaged', value: 'Damaged' },
            { label: 'Theft', value: 'Theft' },
            { label: 'Other', value: 'Other' },
          ]}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-[#0A0D14]">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional details…"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none min-h-[80px] resize-none"
        />
      </div>

      <Button fullWidth size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? 'Reporting…' : 'Report Spoilage'}
      </Button>
    </div>
  );
}

// ── Returns form (look up transaction → select items) ─────────────────────────

function ReturnsForm({ onDone }: { onDone: () => void }) {
  const [saleNumber, setSaleNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <div className="py-8">
        <SuccessScreen
          standalone={false}
          title="Return Logged!"
          subtitle="The return has been recorded successfully."
          primaryAction={<Button fullWidth size="lg" onClick={onDone}>Done</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-start gap-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-3.5 py-3">
        <AlertCircle size={16} className="text-[#EA580C] shrink-0 mt-0.5" />
        <p className="text-xs text-[#EA580C] leading-relaxed">
          Enter the sale number or transaction ID to look up the sale and select which items to return.
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[#0A0D14]">Sale Number / Transaction ID *</label>
        <input
          value={saleNumber}
          onChange={e => setSaleNumber(e.target.value)}
          placeholder="e.g. SALE-0001"
          className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <Button fullWidth size="lg" disabled={!saleNumber.trim()} onClick={() => setShowSuccess(true)}>
        Look up sale
      </Button>
    </div>
  );
}

// ── Main ReturnsSpoilageTab ────────────────────────────────────────────────────

export function ReturnsSpoilageTab() {
  const [subPill, setSubPill] = useState<SubPill>('returns');
  const [locations, setLocations] = useState<any[]>([]);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    locationsApi.list().then((res: any) => setLocations(toArr(res.data))).catch(() => {});
  }, []);

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  const handleActionPress = () => {
    if (subPill === 'returns') {
      setShowForm(true);
    } else {
      setLocationPanelOpen(true);
    }
  };

  const handleLocationSelect = (id: string) => {
    setSelectedLocationId(id);
    setShowForm(true);
  };

  if (showForm && subPill === 'returns') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <p className="text-base font-bold text-[#0A0D14]">Log Return</p>
        </div>
        <ReturnsForm onDone={() => setShowForm(false)} />
      </div>
    );
  }

  if (showForm && subPill === 'spoilage' && selectedLocation) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button type="button" onClick={() => { setShowForm(false); setSelectedLocationId(null); }} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <p className="text-base font-bold text-[#0A0D14]">Report Spoilage</p>
        </div>
        <SpoilageForm locationId={selectedLocation.id} locationName={selectedLocation.name} onDone={() => { setShowForm(false); setSelectedLocationId(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Sub-pills */}
      <div className="flex gap-2.5">
        {(['returns', 'spoilage'] as SubPill[]).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setSubPill(p)}
            className={cn('px-4 py-2 rounded-full text-[13px] font-semibold transition-colors', subPill === p ? 'bg-brand text-white' : 'bg-[#F1F5F9] text-[#64748B]')}
          >
            {p === 'returns' ? 'Returns' : 'Spoilage'}
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2.5 bg-[#EFF5FF] border border-[#DBEAFE] rounded-xl px-3.5 py-3">
        <AlertCircle size={16} className="text-brand shrink-0" />
        <p className="text-[13px] text-[#0A0D14]">
          {subPill === 'returns' ? 'Log a customer return against a previous sale' : 'Record damaged or expired stock at a store'}
        </p>
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={handleActionPress}
        className="w-full h-12 rounded-[10px] bg-[#EFF5FF] border-[1.5px] border-[#DBEAFE] flex items-center justify-center gap-2"
      >
        <PakageIcon width={18} className="text-brand" />
        <span className="text-sm font-semibold text-brand">
          {subPill === 'returns' ? 'Log a Return' : 'Report Spoilage'}
        </span>
      </button>

      <p className="text-[13px] text-[#94A3B8] text-center py-6">
        {subPill === 'returns' ? 'No returns recorded yet' : 'No spoilage records yet'}
      </p>

      {/* Location picker panel */}
      <LocationPanel
        open={locationPanelOpen}
        onClose={() => setLocationPanelOpen(false)}
        locations={locations}
        selected={selectedLocationId}
        onSelect={handleLocationSelect}
        subtitle="Select the store you wish to report spoilage for"
      />
    </div>
  );
}
