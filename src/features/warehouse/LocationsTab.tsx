// src/features/warehouse/LocationsTab.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { LocationDetail } from '@/src/features/warehouse/LocationDetail';
import { DeactivateLocationView } from '@/src/features/warehouse/DeactivateLocationView';
import { DeleteIcon, PakageIcon, PlusIcon } from '@/src/assets/icon';

// TODO: replace with real API call
const initialLocations = [
  {
    id: '1',
    name: 'Main Warehouse',
    address: 'Lagos, Nigeria',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Secondary Depot',
    address: 'Ibadan, Nigeria',
    status: 'active' as const,
  },
];

type Location = (typeof initialLocations)[number];

export function LocationsTab() {
  const [locations, setLocations] = useState(initialLocations);
  const [menuLocation, setMenuLocation] = useState<Location | null>(null);
  const [deactivateLocation, setDeactivateLocation] = useState<Location | null>(
    null
  );
  const [viewLocation, setViewLocation] = useState<Location | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  if (viewLocation) {
    return (
      <LocationDetail
        location={viewLocation}
        onBack={() => setViewLocation(null)}
      />
    );
  }

  if (deactivateLocation) {
    return (
      <DeactivateLocationView
        location={deactivateLocation}
        confirmChecked={confirmChecked}
        onConfirmCheckedChange={setConfirmChecked}
        onBack={() => {
          setDeactivateLocation(null);
          setConfirmChecked(false);
        }}
        onDelete={() => {
          setLocations((prev) =>
            prev.filter((l) => l.id !== deactivateLocation.id)
          );
          setDeactivateLocation(null);
          setConfirmChecked(false);
        }}
      />
    );
  }

  return (
    <div className="relative space-y-4">
      <Link
        href="/warehouse-management/locations/new"
        className="flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary-alpha-10 text-sm font-semibold text-brand"
      >
        <PlusIcon width={20} />
        Add new location
      </Link>

      <div className="space-y-3">
        <p className="font-medium text-sm text-black mb-2">All Location</p>

        <div className="bg-bg-surface rounded-[8px]">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between border-b border-[#9B9EA34D] py-3 px-4"
            >
              <button
                type="button"
                onClick={() => setViewLocation(location)}
                className="flex-1 flex gap-3 text-left items-center"
              >
                <div className="w-10 h-10 rounded-full bg-brand-lighter flex justify-center items-center text-brand">
                  <PakageIcon width={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-default">
                    {location.name}
                  </p>
                  <p className="text-[10px] text-text-muted font-medium">
                    {location.address}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMenuLocation(location)}
                aria-label="Open options"
              >
                <MoreVertical size={18} className="text-neutral-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Options modal — kept for the menu itself, just not for deactivate's content */}
      <Modal isOpen={!!menuLocation} onClose={() => setMenuLocation(null)}>
        <h2 className="text-base font-semibold text-text-default">More</h2>
        <div className="mt-4 space-y-1">
          <button
            type="button"
            onClick={() => {
              if (menuLocation) setViewLocation(menuLocation);
              setMenuLocation(null);
            }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-900 focus:bg-bg-surface flex gap-2 items-center"
          >
            <PakageIcon width={24} />
            View products at this location
          </button>
          <button
            type="button"
            onClick={() => setMenuLocation(null)}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-900 focus:bg-bg-surface flex gap-2 items-center"
          >
            <PakageIcon width={24} />
            Transfer stock out
          </button>
          <button
            type="button"
            onClick={() => {
              setDeactivateLocation(menuLocation);
              setMenuLocation(null);
            }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-error-dark flex gap-2"
          >
            <DeleteIcon />
            Deactivate location
          </button>
        </div>
      </Modal>
    </div>
  );
}
