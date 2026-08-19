'use client';

import { useState } from 'react';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useReceiptStore } from '@/src/store/receiptStore';
import { NoticeIcon, UploadIcon, StoreIcon, PakageIcon } from '@/src/assets/icon';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { cn } from '@/src/lib/utils';

type AdjustStep = 'main' | 'location' | 'product' | 'form';

const MOCK_HISTORY = [
  { id: '1', productName: 'Samsung Galaxy A54', sku: 'SAM-A54-64', reason: 'Found Extra Stock', quantityDelta: 5, locationName: 'Main Warehouse' },
  { id: '2', productName: 'iPhone 13 Pro', sku: 'APP-13P-128', reason: 'Damaged Stock', quantityDelta: -2, locationName: 'Main Warehouse' },
];

const MOCK_LOCATIONS = [
  { id: '1', name: 'Main Warehouse', kind: 'Physical', isPrimary: true },
  { id: '2', name: 'Store Front', kind: 'Physical', isPrimary: false },
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'Samsung Galaxy A54 64GB', sku: 'SAM-A54-64', category: 'Smartphones', currentCount: 150 },
  { id: '2', name: 'iPhone 13 Pro 128GB', sku: 'APP-13P-128', category: 'Smartphones', currentCount: 42 },
];

export function AdjustTab() {
  const router = useRouter();
  const setLastAdjustment = useReceiptStore((s) => s.setLastAdjustment);

  const [step, setStep] = useState<AdjustStep>('main');
  
  // Selections
  const [selectedLoc, setSelectedLoc] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Form state
  const [productSearch, setProductSearch] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    setLastAdjustment({
      location: selectedLoc?.name,
      product: selectedProduct?.name,
      actualCount: quantity.toString(),
      reason,
      notes: notes || '—',
    });
    router.push('/warehouse-management/adjust/success');
  };

  const variance = quantity - (selectedProduct?.currentCount || 0);

  if (step === 'main') {
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => setStep('location')}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-alpha-10 border-2 border-brand/20 text-brand font-semibold hover:bg-brand/10 transition-colors"
        >
          <UploadIcon width={18} className="text-brand" />
          <span>Adjust stock</span>
        </button>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">History</h2>
            <button className="text-sm font-medium text-brand">View all</button>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-3">Recent</p>

          <div className="space-y-0">
            {MOCK_HISTORY.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <UploadIcon width={16} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400 shrink-0">• {item.sku}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-semibold", item.quantityDelta >= 0 ? "text-green-600" : "text-red-500")}>
                    {item.quantityDelta >= 0 ? '+' : ''}{item.quantityDelta} units
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.locationName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'location') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setStep('main')} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Select Location</h2>
        </div>

        <div className="bg-primary-alpha-10 border border-brand/20 rounded-xl p-3.5 flex gap-3 items-start">
          <NoticeIcon width={20} className="text-brand shrink-0 mt-0.5" />
          <p className="text-sm text-gray-900 leading-relaxed">
            Adjustments require a reason and are permanently logged for audit. A positive or negative variance is automatically posted to <span className="font-semibold text-brand">Finance & Accounting</span>.
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                setSelectedLoc(loc);
                setStep('product');
              }}
              className="w-full flex items-center p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand/30 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-alpha-10 flex items-center justify-center shrink-0 mr-3">
                <StoreIcon width={20} className="text-brand" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                  {loc.isPrimary && (
                    <span className="bg-primary-alpha-20 px-2 py-0.5 rounded-full text-[10px] font-medium text-brand">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{loc.kind}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'product') {
    const filteredProducts = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setStep('location')} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Select Product</h2>
        </div>

        <button
          onClick={() => setStep('location')}
          className="w-full flex items-center p-3.5 rounded-xl bg-primary-alpha-10 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 mr-3">
            <StoreIcon width={20} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{selectedLoc?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selectedLoc?.kind}</p>
          </div>
          {selectedLoc?.isPrimary && (
            <span className="bg-primary-alpha-20 px-2 py-0.5 rounded-full text-[10px] font-medium text-brand mr-3">
              Primary
            </span>
          )}
          <ChevronRight size={16} className="text-gray-500" />
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products SKU or category"
            className="w-full h-11 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
          />
        </div>

        <div className="space-y-0">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setQuantity(product.currentCount);
                setStep('form');
              }}
              className="w-full flex items-center py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-left -mx-2 px-2 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-alpha-10 flex items-center justify-center shrink-0 mr-3">
                <PakageIcon width={20} className="text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{product.sku} · {product.category}</p>
              </div>
              <span className="text-sm font-semibold text-brand">Select</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STEP: FORM
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setStep('product')} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Adjust Quantity</h2>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex gap-3 items-start">
        <NoticeIcon width={20} className="text-orange-600 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-600 leading-relaxed">
          Adjustments are logged and final. Verify all quantities carefully before confirming.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900">{selectedProduct?.name}</h3>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900 mb-2">Current count</p>
        <div className="h-12 px-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center">
          <span className="text-sm font-medium text-gray-500">{selectedProduct?.currentCount}</span>
        </div>
      </div>

      <QuantityStepper
        label="New count (New Quantity)"
        value={quantity}
        onChange={setQuantity}
      />

      {quantity !== selectedProduct?.currentCount && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Variance</span>
          <span className={cn("text-sm font-bold", variance >= 0 ? "text-green-600" : "text-red-500")}>
            {variance >= 0 ? '+' : ''}{variance}
          </span>
        </div>
      )}

      <div>
        <span className="text-gray-950 font-medium text-sm whitespace-nowrap flex gap-1 mb-1">
          Reason for adjustment<p className="text-red-500">*</p>
        </span>
        <Dropdown
          placeholder="Select reason"
          value={reason}
          onChange={setReason}
          options={[
            { label: 'Damaged Stock', value: 'Damaged Stock' },
            { label: 'Found Extra Stock', value: 'Found Extra Stock' },
            { label: 'Stock Take Discrepancy', value: 'Stock Take Discrepancy' },
            { label: 'Counting Error', value: 'Counting Error' },
          ]}
        />
      </div>

      <Input
        label="Notes(Optional)"
        value={notes}
        placeholder="Any additional notes about this adjustment..."
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          type="button"
          onClick={() => {
            setStep('main');
            setQuantity(0);
            setReason('');
            setNotes('');
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="button"
          onClick={handleConfirm}
          disabled={!reason}
        >
          Confirm Adjustment
        </Button>
      </div>
    </div>
  );
}
