'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreVertical, HelpCircle, AlertCircle, Eye, ArrowRightLeft, PauseCircle, Trash2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { WareHouseIcon, PlusIcon, NoticeIcon } from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

type DrawerView = 'none' | 'add' | 'deactivate' | 'success';

function LocationMenu({ location, onDeactivate }: { location: any; onDeactivate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div ref={ref} className="relative ml-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="p-1 rounded-full hover:bg-gray-100 text-text-muted"><MoreVertical size={18} /></button>
      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[220px] rounded-2xl border border-gray-100 bg-white shadow-lg py-1.5">
          <p className="px-4 pt-1 pb-2 text-sm font-semibold text-text-default">More</p>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-default hover:bg-bg-surface text-left" onClick={() => setOpen(false)}><Eye size={16} className="text-text-muted" />View products at this location</button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-default hover:bg-bg-surface text-left" onClick={() => setOpen(false)}><ArrowRightLeft size={16} className="text-text-muted" />Transfer stock out</button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-error-dark hover:bg-red-50 text-left" onClick={() => { setOpen(false); onDeactivate(); }}><Trash2 size={16} />Deactivate location</button>
        </div>
      )}
    </div>
  );
}

const DEACTIVATION_EFFECTS = [
  'Removed from the active locations list',
  'No new stock can be received here',
  'No transfers in or out allowed',
  'All historical records are preserved',
  'Location can be reactivated at any time',
];

export function LocationsTab() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerView, setDrawerView] = useState<DrawerView>('none');
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Add form state
  const [warehouseName, setWarehouseName] = useState('');
  const [address1, setAddress1] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [capacityNotes, setCapacityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    locationsApi.list()
      .then((res: any) => setLocations(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const closeDrawer = () => { setDrawerView('none'); setSelectedLocation(null); setConfirmChecked(false); };

  const handleDeactivate = async () => {
    if (!selectedLocation || !confirmChecked) return;
    setDeactivating(true);
    try {
      await locationsApi.deactivate(selectedLocation.id);
      setLocations((prev) => prev.map((l) => l.id === selectedLocation.id ? { ...l, isActive: false } : l));
      setDrawerView('success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setDeactivating(false);
    }
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseName.trim()) { toast.error('Warehouse name is required'); return; }
    setIsSubmitting(true);
    try {
      const res: any = await locationsApi.createWarehouse({ name: warehouseName.trim(), address: address1 || undefined, country: country || undefined, state: state || undefined, city: city || undefined, capacityNotes: capacityNotes || undefined, makePrimary: false });
      setLocations((prev) => [...prev, res.data]);
      toast.success('Warehouse added');
      setWarehouseName(''); setAddress1(''); setCountry(''); setState(''); setCity(''); setCapacityNotes('');
      setDrawerView('success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setDrawerView('add')} className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary-alpha-10 text-sm font-semibold text-brand">
        <PlusIcon width={20} />Add New Location
      </button>

      <div>
        <p className="font-medium text-sm text-text-default mb-3">All Locations</p>
        {loading ? (
          <div className="text-center py-8 text-text-muted text-sm">Loading…</div>
        ) : (
          <div className="bg-bg-surface rounded-[8px] overflow-visible">
            {locations.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No locations yet</p>
            ) : locations.map((location, idx) => (
              <div key={location.id} className={cn('flex items-center justify-between py-3 px-4', idx < locations.length - 1 && 'border-b border-[#9B9EA34D]')}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-brand-lighter flex justify-center items-center text-brand"><WareHouseIcon /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-text-default truncate">{location.name}</p>
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', location.isActive ? 'bg-emerald-50 text-emerald-dark' : 'bg-gray-100 text-text-muted')}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">{location.kind}</p>
                  </div>
                </div>
                <LocationMenu location={location} onDeactivate={() => { setSelectedLocation(location); setConfirmChecked(false); setDrawerView('deactivate'); }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      <Modal isOpen={drawerView === 'add'} onClose={closeDrawer}>
        <div className="flex items-start justify-between mb-1">
          <div><h2 className="text-lg font-semibold text-text-default">Add New Warehouse</h2><p className="text-xs text-text-muted mt-0.5">Add your primary warehouse details</p></div>
          <button type="button" onClick={closeDrawer} className="text-text-muted hover:text-text-subtle"><HelpCircle size={18} /></button>
        </div>
        <form onSubmit={handleSaveWarehouse} noValidate className="mt-5 space-y-4">
          {[{ label: 'Warehouse Name *', value: warehouseName, setter: setWarehouseName, placeholder: 'Enter warehouse name', required: true },
            { label: 'Address Line 1 *', value: address1, setter: setAddress1, placeholder: 'Enter address', required: true },
            { label: 'Country', value: country, setter: setCountry, placeholder: 'e.g. Nigeria', required: false },
            { label: 'State', value: state, setter: setState, placeholder: 'e.g. Lagos', required: false },
            { label: 'City', value: city, setter: setCity, placeholder: 'e.g. Victoria Island', required: false },
            { label: 'Capacity Notes', value: capacityNotes, setter: setCapacityNotes, placeholder: 'Optional', required: false },
          ].map(({ label, value, setter, placeholder, required }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-semibold text-text-default">{label}</label>
              <input required={required} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm text-text-default placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10" />
            </div>
          ))}
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save New Warehouse'}</Button>
          <div className="flex items-start gap-3 rounded-[10px] bg-bg-surface px-3 py-3">
            <NoticeIcon width={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">You can change any of these details in business settings</p>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
      <Modal isOpen={drawerView === 'deactivate'} onClose={closeDrawer}>
        {selectedLocation && (
          <>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-default">Deactivate Location</h2>
              <button type="button" onClick={closeDrawer} className="text-text-muted hover:text-text-subtle"><HelpCircle size={18} /></button>
            </div>
            <div className="rounded-xl bg-bg-surface p-4 flex items-start gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-brand-lighter flex justify-center items-center text-brand"><WareHouseIcon /></div>
              <div>
                <p className="text-sm font-semibold text-text-default">{selectedLocation.name}</p>
                <p className="text-xs text-text-muted">{selectedLocation.kind}</p>
              </div>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex gap-3 mb-4">
              <AlertCircle size={18} className="text-error-dark flex-shrink-0 mt-0.5" />
              <p className="text-error-dark text-sm font-medium leading-relaxed">Transfer all stock out before deactivating.</p>
            </div>
            <div className="rounded-xl bg-bg-surface p-4 mb-5">
              <p className="text-sm font-semibold text-text-default mb-2">What happens on deactivation</p>
              <div className="divide-y divide-[#9B9EA34D]">
                {DEACTIVATION_EFFECTS.map((effect) => (
                  <div key={effect} className="flex items-center gap-3 py-2.5">
                    <WareHouseIcon />
                    <p className="text-xs text-text-default font-medium">{effect}</p>
                  </div>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-text-subtle cursor-pointer mb-4">
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="accent-brand w-4 h-4 rounded" />
              I understand this location will be deactivated
            </label>
            <Button fullWidth size="lg" type="button" disabled={!confirmChecked || deactivating} onClick={handleDeactivate} className="bg-red-500 hover:bg-red-600 disabled:opacity-50">
              {deactivating ? 'Deactivating…' : 'Deactivate Warehouse'}
            </Button>
          </>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={drawerView === 'success'} onClose={closeDrawer}>
        <SuccessScreen standalone={false} title="Operation completed successfully." subtitle="Your changes have been saved." primaryAction={<Button variant="secondary" fullWidth size="lg" type="button" onClick={closeDrawer}>Close</Button>} />
      </Modal>
    </div>
  );
}
