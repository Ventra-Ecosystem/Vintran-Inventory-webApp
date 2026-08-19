'use client';

import { useState } from 'react';
import { StoreIcon, PlusIcon } from '@/src/assets/icon';
import { Search, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

const MOCK_VINTRAN_SUPPLIERS = [
  { id: '1', name: 'Tech Solutions Ltd', kind: 'Electronics', contactPerson: 'John Doe', status: 'Active' },
  { id: '2', name: 'Global Logistics', kind: 'Transport', contactPerson: 'Jane Smith', status: 'Pending' },
];

const MOCK_FAVOURITES = [
  { id: '3', name: 'Premium Goods', kind: 'Wholesale', status: 'Active' },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

export function SuppliersView() {
  const [showAllVintran, setShowAllVintran] = useState(false);
  const displayedVintran = showAllVintran ? MOCK_VINTRAN_SUPPLIERS : MOCK_VINTRAN_SUPPLIERS.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Top Vintran Suppliers</h2>
        {MOCK_VINTRAN_SUPPLIERS.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllVintran(!showAllVintran)}
            className="text-sm font-medium text-brand"
          >
            {showAllVintran ? 'Show less' : 'See all'}
          </button>
        )}
      </div>

      {displayedVintran.length === 0 ? (
        <p className="text-sm text-gray-500">No Vintran suppliers linked yet</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayedVintran.map((item) => (
            <div
              key={item.id}
              className="min-w-[145px] p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-brand/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-primary-alpha-10 flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-brand">{getInitials(item.name)}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.contactPerson ?? item.kind}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {item.status === 'Active' ? (
                  <CheckCircle2 size={12} className="text-green-600" />
                ) : (
                  <Clock size={12} className="text-amber-600" />
                )}
                <span className="text-[10px] font-medium text-gray-500">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-alpha-10 border-2 border-brand/20 text-brand font-semibold hover:bg-brand/10 transition-colors"
      >
        <PlusIcon width={18} className="text-brand" />
        <span>Add a Supplier</span>
      </button>

      <h2 className="text-base font-bold text-gray-900 pt-2">Favourite suppliers</h2>
      
      {MOCK_FAVOURITES.length === 0 ? (
        <p className="text-sm text-gray-500">No favourite suppliers yet</p>
      ) : (
        <div className="space-y-4">
          {MOCK_FAVOURITES.map((item) => (
            <div key={item.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-alpha-10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand">{getInitials(item.name)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-primary-alpha-10 px-2 py-0.5 rounded-full text-[10px] font-medium text-brand">
                      {item.kind}
                    </span>
                    <span className="text-xs text-gray-500">{item.status}</span>
                  </div>
                </div>
              </div>
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
