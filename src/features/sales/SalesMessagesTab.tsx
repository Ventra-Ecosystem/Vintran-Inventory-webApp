'use client';

import { useEffect, useState } from 'react';
import { PakageIcon } from '@/src/assets/icon';
import { SupplierChat } from './SupplierChat';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import type { Supplier, HeaderOverride } from './types';

interface SalesMessagesTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function SalesMessagesTab({ onHeaderChange, onClearOverride }: SalesMessagesTabProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Supplier | null>(null);

  useEffect(() => {
    suppliersApi.list()
      .then((res: any) => {
        const items: any[] = toArr(res.data);
        setSuppliers(items.map((s: any) => ({
          id: s.id,
          name: s.name,
          contact: s.contactPerson ?? '',
          phone: s.phoneNumber ?? s.phone ?? '',
          email: s.email ?? '',
          address: s.address ?? '',
          category: s.productCategories ?? '',
        })));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load suppliers');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openChat = (supplier: Supplier) => {
    setActiveChat(supplier);
    onHeaderChange({
      title: supplier.name,
      onBack: () => {
        setActiveChat(null);
        onClearOverride();
      },
    });
  };

  if (activeChat) return <SupplierChat supplier={activeChat} />;

  return (
    <div className="bg-bg-surface rounded-[8px]">
      {loading ? (
        <p className="text-sm text-text-muted text-center py-6">Loading…</p>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-6">No suppliers yet</p>
      ) : suppliers.map((s, idx) => (
        <div
          key={s.id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            idx < suppliers.length - 1 ? 'border-b border-[#9B9EA34D]' : ''
          }`}
          onClick={() => openChat(s)}
        >
          <div className="h-10 w-10 rounded-full bg-brand-lighter flex items-center justify-center shrink-0">
            <PakageIcon width={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-default truncate">{s.name}</p>
            <p className="text-[10px] text-text-muted">Tap to view conversation</p>
          </div>
        </div>
      ))}
    </div>
  );
}
