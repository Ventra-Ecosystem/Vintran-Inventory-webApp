'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useReceiptStore } from '@/src/store/receiptStore';
import { NoticeIcon } from '@/src/assets/icon';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';

export function AdjustTab() {
  const router = useRouter();
  const setLastAdjustment = useReceiptStore((s) => s.setLastAdjustment);

  const [location, setLocation] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [actualCount, setActualCount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(0);

  const handleConfirm = () => {
    setLastAdjustment({
      location,
      product: productQuery,
      actualCount,
      reason,
      notes: notes || '—',
    });
    router.push('/warehouse-management/adjust/success');
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-lighter rounded-[10px] py-4 px-3.5 flex gap-3 items-start">
        <NoticeIcon width={36} />
        <p className="text-[#BB5902] text-sm font-medium">
          Adjustments are logged and final. Verify all quantities carefully
          before confirming.
        </p>
      </div>

      <div>
        <span className="text-gray-950 font-medium text-sm whitespace-nowrap flex gap-1 mb-1">
          Location <p className="text-red-400">*</p>
        </span>
        <Dropdown
          placeholder="Select location"
          value={location}
          onChange={setLocation}
          options={[
            { label: 'Warehouse 1', value: 'warehouse1' },
            { label: 'Warehouse 2', value: 'warehouse2' },
            { label: 'Warehouse 3', value: 'warehouse3' },
          ]}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-950 mb-2">Product</p>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#525866]"
          />
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Search by name or SKU..."
            className="h-10 w-full pl-11 pr-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
          />
        </div>
      </div>

      <div className="rounded-[16px] text-brand-dark bg-brand-lighter text-xs py-3 px-4 flex justify-between">
        <p className="font-medium">System recorded quantity</p>
        <p className="font-semibold">150 units</p>
      </div>

      <QuantityStepper
        label="Actual count (New Quantity)"
        value={quantity}
        onChange={setQuantity}
      />

      <div>
        <span className="text-gray-950 font-medium text-sm whitespace-nowrap flex gap-1 mb-1">
          Reason for adjustment<p className="text-red-400">*</p>
        </span>
        <Dropdown
          placeholder="Select reason"
          value={reason}
          onChange={setReason}
          options={[
            { label: 'Reason 1', value: 'reason1' },
            { label: 'Reason 2', value: 'reason2' },
            { label: 'Reason 3', value: 'reason3' },
          ]}
        />
      </div>

      <Input
        label="Notes(Optional)"
        value={notes}
        placeholder="Any additional notes about this adjustment..."
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="button"
          onClick={handleConfirm}
        >
          Confirm Adjustment
        </Button>
      </div>
    </div>
  );
}
