// src/features/sales/SalesMessagesTab.tsx
'use client';

import { useState } from 'react';
import { PakageIcon } from '@/src/assets/icon';
import { SupplierChat } from './SupplierChat';
import type { Supplier, HeaderOverride } from './types';

const mockConversations: Supplier[] = [
  {
    id: '1',
    name: 'Agro Supplies Ltd',
    contact: 'Emeka Obi',
    phone: '',
    email: '',
    address: '',
    category: 'Grains',
  },
  {
    id: '2',
    name: 'PetroBase NG',
    contact: 'Aisha Musa',
    phone: '',
    email: '',
    address: '',
    category: 'Oils',
  },
];

interface SalesMessagesTabProps {
  onHeaderChange: (o: HeaderOverride) => void;
  onClearOverride: () => void;
}

export function SalesMessagesTab({
  onHeaderChange,
  onClearOverride,
}: SalesMessagesTabProps) {
  const [activeChat, setActiveChat] = useState<Supplier | null>(null);

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
      {mockConversations.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 border-b border-[#9B9EA34D] px-4 py-3 last:border-0 cursor-pointer"
          onClick={() => openChat(s)}
        >
          <div className="h-10 w-10 rounded-full bg-brand-lighter flex items-center justify-center">
            <PakageIcon width={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-default">{s.name}</p>
            <p className="text-[10px] text-text-muted">
              Tap to view conversation
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
