// src/features/warehouse/LocationsTab.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, HelpCircle, AlertCircle, Eye, ArrowRightLeft, PauseCircle, Trash2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { WareHouseIcon, PlusIcon, NoticeIcon } from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';

type LocationStatus = 'active' | 'inactive';

interface Location {
  id: string;
  name: string;
  type: string;
  skus: number;
  status: LocationStatus;
  stockUnits: number;
}

const initialLocations: Location[] = [
  { id: '1', name: 'Main Warehouse', type: 'Physical', skus: 180, status: 'active', stockUnits: 0 },
  { id: '2', name: 'Store A · Victoria Island', type: 'Store-Warehouse', skus: 67, status: 'inactive', stockUnits: 180 },
];

const DEACTIVATION_EFFECTS = [
  'Removed from the active locations list',
  'No new stock can be received here',
  'No transfers in or out allowed',
  'All historical records are preserved',
  'Location can be reactivated at any time',
];

type DrawerView = 'none' | 'add' | 'deactivate' | 'success';

// ── Floating context-menu dropdown ─────────────────────────────
function LocationMenu({
  location,
  onDeactivate,
}: {
  location: Location;
  onDeactivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open options"
        className="p-1 rounded-full hover:bg-gray-100 text-text-muted"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[220px] rounded-2xl border border-gray-100 bg-white shadow-lg py-1.5">
          <p className="px-4 pt-1 pb-2 text-sm font-semibold text-text-default">More</p>

          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-default hover:bg-bg-surface text-left"
            onClick={() => setOpen(false)}
          >
            <Eye size={16} className="text-text-muted flex-shrink-0" />
            View products at this location
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-default hover:bg-bg-surface text-left"
            onClick={() => setOpen(false)}
          >
            <ArrowRightLeft size={16} className="text-text-muted flex-shrink-0" />
            Transfer stock out
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-default hover:bg-bg-surface text-left"
            onClick={() => setOpen(false)}
          >
            <PauseCircle size={16} className="text-text-muted flex-shrink-0" />
            Suspend Location
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-error-dark hover:bg-red-50 text-left"
            onClick={() => {
              setOpen(false);
              onDeactivate();
            }}
          >
            <Trash2 size={16} className="flex-shrink-0" />
            Deactivate location
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main tab ───────────────────────────────────────────────────
export function LocationsTab() {
  const [locations, setLocations] = useState(initialLocations);
  const [drawerView, setDrawerView] = useState<DrawerView>('none');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Add form state
  const [warehouseName, setWarehouseName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [capacityNotes, setCapacityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDrawer = () => {
    setDrawerView('none');
    setSelectedLocation(null);
    setConfirmChecked(false);
  };

  const openDeactivate = (loc: Location) => {
    setSelectedLocation(loc);
    setConfirmChecked(false);
    setDrawerView('deactivate');
  };

  const handleDeactivate = () => {
    if (!selectedLocation) return;
    setLocations((prev) =>
      prev.map((l) =>
        l.id === selectedLocation.id ? { ...l, status: 'inactive' as LocationStatus } : l
      )
    );
    setDrawerView('success');
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setWarehouseName('');
      setAddress1('');
      setAddress2('');
      setCountry('');
      setState('');
      setCity('');
      setCapacityNotes('');
      setDrawerView('success');
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Add New Location button */}
      <button
        type="button"
        onClick={() => setDrawerView('add')}
        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary-alpha-10 text-sm font-semibold text-brand"
      >
        <PlusIcon width={20} />
        Add New Location
      </button>

      {/* Locations list */}
      <div>
        <p className="font-medium text-sm text-text-default mb-3">All Locations</p>
        <div className="bg-bg-surface rounded-[8px] overflow-visible">
          {locations.map((location, idx) => (
            <div
              key={location.id}
              className={cn(
                'flex items-center justify-between py-3 px-4',
                idx < locations.length - 1 && 'border-b border-[#9B9EA34D]'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-brand-lighter flex justify-center items-center text-brand">
                  <WareHouseIcon />
                </div>
                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-text-default truncate">
                      {location.name}
                    </p>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        location.status === 'active'
                          ? 'bg-emerald-50 text-emerald-dark'
                          : 'bg-gray-100 text-text-muted'
                      )}
                    >
                      {location.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5">
                    {location.type} · {location.skus} SKUs
                  </p>
                </div>
              </div>

              {/* Floating dropdown menu — no Modal */}
              <LocationMenu
                location={location}
                onDeactivate={() => openDeactivate(location)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Add New Warehouse modal ── */}
      <Modal isOpen={drawerView === 'add'} onClose={closeDrawer}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-text-default">Add New Warehouse</h2>
            <p className="text-xs text-text-muted mt-0.5">Add your primary warehouse details</p>
          </div>
          <button type="button" onClick={closeDrawer} className="text-text-muted hover:text-text-subtle">
            <HelpCircle size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveWarehouse} noValidate className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">
              Warehouse Name <span className="text-error-dark">*</span>
            </label>
            <input
              required
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              placeholder="Enter warehouse name"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm text-text-default placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">
              Address Line 1 <span className="text-error-dark">*</span>
            </label>
            <input
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Enter address"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm text-text-default placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">Address Line 2</label>
            <input
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Enter address"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm text-text-default placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            />
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">
              Country <span className="text-error-dark">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-gray-200 px-4 pr-9 text-sm text-text-default appearance-none bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
              >
                <option value="" disabled>Select Country</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
                <option value="KE">Kenya</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
            </div>
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">
              State <span className="text-error-dark">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-gray-200 px-4 pr-9 text-sm text-text-default appearance-none bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
              >
                <option value="" disabled>Select state</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="rivers">Rivers</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
            </div>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">
              City <span className="text-error-dark">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-gray-200 px-4 pr-9 text-sm text-text-default appearance-none bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
              >
                <option value="" disabled>Select City</option>
                <option value="ikeja">Ikeja</option>
                <option value="vi">Victoria Island</option>
                <option value="lekki">Lekki</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-default">Capacity Notes</label>
            <input
              value={capacityNotes}
              onChange={(e) => setCapacityNotes(e.target.value)}
              placeholder="Enter address"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm text-text-default placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            />
          </div>

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save New Warehouse'}
          </Button>

          <div className="flex items-start gap-3 rounded-[10px] bg-bg-surface px-3 py-3">
            <NoticeIcon width={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              You can change any of these details and add more information in business settings
            </p>
          </div>
        </form>
      </Modal>

      {/* ── Deactivate Location modal ── */}
      <Modal isOpen={drawerView === 'deactivate'} onClose={closeDrawer}>
        {selectedLocation && (
          <>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-default">Deactivate Location</h2>
              <button type="button" onClick={closeDrawer} className="text-text-muted hover:text-text-subtle">
                <HelpCircle size={18} />
              </button>
            </div>

            {/* Location card */}
            <div className="rounded-xl bg-bg-surface p-4 flex items-start gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-brand-lighter flex justify-center items-center text-brand">
                <WareHouseIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-default">{selectedLocation.name}</p>
                <p className="text-xs text-text-muted">{selectedLocation.type} · {selectedLocation.skus} SKUs</p>
                {selectedLocation.stockUnits > 0 && (
                  <p className="text-xs font-medium text-amber-600 mt-0.5">
                    {selectedLocation.stockUnits} units still in stock
                  </p>
                )}
              </div>
            </div>

            {/* Warning */}
            {selectedLocation.stockUnits > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex gap-3 mb-4">
                <AlertCircle size={18} className="text-error-dark flex-shrink-0 mt-0.5" />
                <p className="text-error-dark text-sm font-medium leading-relaxed">
                  {selectedLocation.stockUnits} units of stock remain here. Transfer all stock to another location before deactivating.
                </p>
              </div>
            )}

            {/* Transfer CTA */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-[10px] bg-primary-alpha-10 text-brand text-sm font-semibold mb-3"
            >
              <ArrowRightLeft size={16} />
              Transfer stock out first
            </button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-text-muted whitespace-nowrap">then proceed below</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* What happens */}
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

            {/* Confirm checkbox */}
            <label className="flex items-center gap-2 text-xs text-text-subtle cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="accent-brand w-4 h-4 rounded"
              />
              I understand this location will be deactivated
            </label>

            <Button
              fullWidth
              size="lg"
              type="button"
              disabled={!confirmChecked}
              onClick={handleDeactivate}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              Deactivate Warehouse
            </Button>
          </>
        )}
      </Modal>

      {/* ── Success modal ── */}
      <Modal isOpen={drawerView === 'success'} onClose={closeDrawer}>
        <SuccessScreen
          standalone={false}
          title="Store A is now your active warehouse."
          subtitle="All inventory, stock movements, and fulfillments will be managed from this location."
          primaryAction={
            <Button variant="secondary" fullWidth size="lg" type="button" onClick={closeDrawer}>
              Proceed to Dashboard
            </Button>
          }
        />
      </Modal>
    </div>
  );
}
