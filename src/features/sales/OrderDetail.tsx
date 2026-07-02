// src/features/sales/OrderDetail.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import type { Order } from './types';

type PaymentOption = 'external' | 'vintran-pay' | 'escrow';

const paymentOptions: {
  value: PaymentOption;
  label: string;
  description: string;
}[] = [
  {
    value: 'external',
    label: 'External payment',
    description: 'Pay via bank transfer or cash',
  },
  {
    value: 'vintran-pay',
    label: 'Vintran Pay',
    description: 'Pay instantly with your Vintran wallet',
  },
  {
    value: 'escrow',
    label: 'Escrow',
    description: 'Funds held securely until order is confirmed',
  },
];

const timelineSteps = [
  'Order submitted',
  'Payment',
  'Goods received',
  'Complete',
];

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(
    null
  );

  if (showPayment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowPayment(false)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700"
        >
          <ArrowLeft size={16} />
          Back to order
        </button>

        <h2 className="text-base font-semibold text-neutral-900">
          Select payment method
        </h2>

        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedPayment(opt.value)}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-colors',
                selectedPayment === opt.value
                  ? 'border-brand bg-primary-alpha-10'
                  : 'border-neutral-100'
              )}
            >
              <p className="text-sm font-semibold text-neutral-900">
                {opt.label}
              </p>
              <p className="text-xs text-text-subtle">{opt.description}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setShowPayment(false)}
          >
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="button"
            disabled={!selectedPayment}
          >
            Proceed with{' '}
            {paymentOptions.find((o) => o.value === selectedPayment)?.label ??
              '…'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-neutral-700"
      >
        <ArrowLeft size={16} />
        Back to orders
      </button>

      {/* Order timeline */}
      <div className="flex items-center justify-between">
        {timelineSteps.map((step, i) => (
          <div key={step} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                i === 0
                  ? 'bg-brand text-white'
                  : 'bg-bg-surface text-text-muted'
              )}
            >
              {i === 0 ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <p className="text-[9px] font-medium text-text-muted text-center leading-tight">
              {step}
            </p>
            {i < timelineSteps.length - 1 && (
              <div className="absolute mt-3 h-[1px] w-full bg-neutral-100" />
            )}
          </div>
        ))}
      </div>

      {/* Order details */}
      <div className="rounded-xl border border-neutral-100 p-4 space-y-2">
        {[
          ['Order ID', order.id],
          ['Supplier', order.supplierName],
          ['Date', order.date],
          ['Total', order.total],
          ['Status', order.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between text-sm border-b border-neutral-50 pb-2 last:border-0"
          >
            <span className="text-text-subtle">{label}</span>
            <span className="font-medium text-neutral-900">{value}</span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">Items</p>
        <div className="bg-bg-surface rounded-[8px]">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between px-4 py-3 border-b border-[#9B9EA34D] last:border-0"
            >
              <p className="text-xs font-medium text-text-default">
                {item.name} × {item.quantity}
              </p>
              <p className="text-xs font-semibold text-text-default">
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth size="lg" type="button">
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="button"
          onClick={() => setShowPayment(true)}
        >
          Pay now
        </Button>
      </div>
    </div>
  );
}
