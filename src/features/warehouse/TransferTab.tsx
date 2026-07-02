'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { useReceiptStore } from '@/src/store/receiptStore';
import { NoticeIcon } from '@/src/assets/icon';

type DestinationType = 'all' | 'store' | 'warehouse';

export function TransferTab() {
  const router = useRouter();
  const setLastTransfer = useReceiptStore((s) => s.setLastTransfer);

  const [destinationType, setDestinationType] =
    useState<DestinationType>('all');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [quantity, setQuantity] = useState(0);

  const handleConfirm = () => {
    setLastTransfer({
      destinationType,
      source,
      destination,
      product: productQuery,
      quantity: String(quantity),
    });
    router.push('/warehouse-management/transfer/success');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-950">
          Transfer destination type
        </label>
        <SegmentedTabs
          options={[
            { value: 'all', label: 'All' },
            { value: 'store', label: 'To store' },
            { value: 'warehouse', label: 'To warehouse' },
          ]}
          value={destinationType}
          onChange={setDestinationType}
        />
      </div>
      <div className="bg-amber-lighter rounded-[10px] py-4 px-3.5 flex gap-6 items-start">
        <NoticeIcon width={28} />
        <p className="text-[#BB5902] text-sm font-medium">
          Stock must be transferred to a store before it can be sold in-store.
        </p>
      </div>

      <Input
        label="Source - From *"
        value={source}
        placeholder="Select warehouse"
        onChange={(e) => setSource(e.target.value)}
      />
      <Input
        label="Destination - To *"
        value={destination}
        placeholder="Select store"
        onChange={(e) => setDestination(e.target.value)}
      />

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
        <p className="font-medium">Available in source</p>
        <p className="font-semibold">150 units</p>
      </div>

      <QuantityStepper
        label="Quantity to transfer"
        value={quantity}
        onChange={setQuantity}
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
          Confirm transfer
        </Button>
      </div>
    </div>
  );
}
