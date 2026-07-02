// src/features/warehouse/ReceiveTab.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { useReceiptStore } from '@/src/store/receiptStore';

export function ReceiveTab() {
  const router = useRouter();
  const setLastReceipt = useReceiptStore((s) => s.setLastReceipt);

  const [productQuery, setProductQuery] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [receivingLocation, setReceivingLocation] = useState('');
  const [supplierRef, setSupplierRef] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    setLastReceipt({
      product: productQuery,
      quantity: String(quantity),
      batchNo: batchNo || '—',
      expiryDate: expiryDate || '—',
      costPerUnit,
      receivingLocation,
      supplierRef: supplierRef || '—',
      notes: notes || '—',
    });
    router.push('/warehouse-management/receive/success');
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-950 font-medium text-sm mb-1">Product</p>
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

      <QuantityStepper
        label="Quantity received"
        value={quantity}
        onChange={setQuantity}
      />

      <div className="flex gap-5 justify-between">
        <Input
          label="Batch/lot no (optional)"
          value={batchNo}
          placeholder="Batch/lot ref."
          onChange={(e) => setBatchNo(e.target.value)}
        />
        <Input
          label="Expiry date"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </div>
      <Input
        label="Cost per unit"
        type="number"
        placeholder="₦0.00"
        value={costPerUnit}
        onChange={(e) => setCostPerUnit(e.target.value)}
      />
      <Input
        label="Receiving location"
        value={receivingLocation}
        placeholder="Select location"
        onChange={(e) => setReceivingLocation(e.target.value)}
      />
      <Input
        label="Supplier PO reference (optional)"
        value={supplierRef}
        placeholder="eg PO-2026-0021"
        onChange={(e) => setSupplierRef(e.target.value)}
      />
      <Input
        label="Notes"
        value={notes}
        placeholder="Any additional notes about this receipt..."
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
          Confirm receipt
        </Button>
      </div>
    </div>
  );
}
