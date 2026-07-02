// src/components/ui/QuantityStepper.tsx
'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantityStepper({
  label,
  value,
  onChange,
  min = 0,
}: QuantityStepperProps) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-950">
        {label}
      </label>
      <div className="flex gap-3 justify-between">
        <div className="flex h-12 w-full rounded-xl border border-[#E2E4E9] ">
          <input
            type="number"
            value={value}
            onChange={(e) =>
              onChange(Math.max(min, Number(e.target.value) || 0))
            }
            className="w-16 text-center text-base font-medium text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex border border-[#E2E4E9] rounded-lg">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex w-10 items-center justify-center  text-neutral-700"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <div className="w-[1px] my-1.5 bg-[#9B9EA3]"></div>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex w-10 items-center justify-center  text-neutral-700"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
