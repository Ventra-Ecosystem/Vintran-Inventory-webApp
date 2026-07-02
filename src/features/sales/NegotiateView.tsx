'use client';

import { useState } from 'react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import type { Product, Supplier } from './types';
import { SupplierChat } from './SupplierChat';

type NegotiateMethod = 'percentage' | 'fixed';

interface NegotiateViewProps {
  product: Product;
  supplier: Supplier;
  onCancel: () => void;
}

export function NegotiateView({
  product,
  supplier,
  onCancel,
}: NegotiateViewProps) {
  const [method, setMethod] = useState<NegotiateMethod>('percentage');
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  const basePrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  const discount = parseFloat(value) || 0;
  const proposedPrice =
    method === 'percentage'
      ? basePrice - (basePrice * discount) / 100
      : basePrice - discount;

  if (sent) {
    return (
      <SupplierChat
        supplier={supplier}
        proposalMessage={`Proposal for ${product.name}: ${method === 'percentage' ? `${discount}% discount` : `₦${discount} reduction`}. Proposed price: ₦${proposedPrice.toLocaleString()}`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {product.name}
          </p>
          <p className="text-xs text-text-subtle">{product.price}</p>
        </div>
        <span className="text-[10px] font-semibold text-brand bg-primary-alpha-10 px-2 py-1 rounded-full">
          Negotiable
        </span>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">
          Negotiate by
        </p>
        <div className="flex gap-2 rounded-xl bg-bg-surface p-1">
          {(['percentage', 'fixed'] as NegotiateMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-xs font-semibold transition-colors',
                method === m
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-text-subtle'
              )}
            >
              {m === 'percentage' ? 'Percentage' : 'Fixed amount'}
            </button>
          ))}
        </div>
      </div>

      <Input
        label={
          method === 'percentage'
            ? 'Proposed discount (%)'
            : 'Proposed reduction (₦)'
        }
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {value && (
        <div className="rounded-xl bg-bg-surface p-4">
          <p className="text-xs text-text-subtle">Proposal preview</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">
            {method === 'percentage'
              ? `${discount}% off`
              : `₦${discount.toLocaleString()} reduction`}
          </p>
          <p className="text-xs text-text-muted">
            {product.price} → ₦{proposedPrice.toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          fullWidth
          size="lg"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="button"
          onClick={() => setSent(true)}
        >
          Send proposal to supplier
        </Button>
      </div>
    </div>
  );
}
