'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { useReceiptStore } from '@/src/store/receiptStore';
import { stockApi, locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export function ReceiveTab() {
  const router = useRouter();
  const setLastReceipt = useReceiptStore((s) => s.setLastReceipt);

  const [productId, setProductId] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [receivingLocation, setReceivingLocation] = useState('');
  const [supplierRef, setSupplierRef] = useState('');
  const [notes, setNotes] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    locationsApi.list().then((res: any) => setLocations(res.data ?? [])).catch(() => {});
  }, []);

  const handleConfirm = async () => {
    if (!productId.trim()) { toast.error('Please enter a Product ID'); return; }
    if (!receivingLocation) { toast.error('Please select a receiving location'); return; }
    if (quantity <= 0) { toast.error('Quantity must be greater than 0'); return; }
    setSubmitting(true);
    try {
      await stockApi.receive({
        productId: productId.trim(),
        locationId: receivingLocation,
        quantity,
        unitCost: costPerUnit ? Number(costPerUnit) : undefined,
        batchReference: batchNo || undefined,
      });
      setLastReceipt({ product: productQuery || productId, quantity: String(quantity), batchNo: batchNo || '—', expiryDate: expiryDate || '—', costPerUnit, receivingLocation, supplierRef: supplierRef || '—', notes: notes || '—' });
      toast.success('Stock received successfully');
      router.push('/warehouse-management/receive/success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-950 font-medium text-sm mb-1">Product search</p>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#525866]" />
          <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search by name or SKU..." className="h-10 w-full pl-11 pr-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10" />
        </div>
      </div>
      <Input label="Product ID *" value={productId} placeholder="Paste product ID here" onChange={(e) => setProductId(e.target.value)} required />
      <QuantityStepper label="Quantity received" value={quantity} onChange={setQuantity} />
      <div className="flex gap-5 justify-between">
        <Input label="Batch/lot no (optional)" value={batchNo} placeholder="Batch/lot ref." onChange={(e) => setBatchNo(e.target.value)} />
        <Input label="Expiry date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
      </div>
      <Input label="Cost per unit" type="number" placeholder="₦0.00" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
      <div>
        <p className="text-gray-950 font-medium text-sm mb-1">Receiving location *</p>
        <select value={receivingLocation} onChange={(e) => setReceivingLocation(e.target.value)} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none">
          <option value="">Select location</option>
          {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <Input label="Supplier PO reference (optional)" value={supplierRef} placeholder="eg PO-2026-0021" onChange={(e) => setSupplierRef(e.target.value)} />
      <Input label="Notes" value={notes} placeholder="Any additional notes..." onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth size="lg" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button variant="primary" fullWidth size="lg" type="button" disabled={submitting} onClick={handleConfirm}>
          {submitting ? 'Saving…' : 'Confirm receipt'}
        </Button>
      </div>
    </div>
  );
}
