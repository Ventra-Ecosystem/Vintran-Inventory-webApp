'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = Array(length).fill('');
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i];
    }
    return arr;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value !== undefined) {
      const arr = Array(length).fill('');
      for (let i = 0; i < Math.min(value.length, length); i++) {
        arr[i] = value[i];
      }
      setDigits(arr);
    }
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    // Take last entered character if multiple typed
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return; // numbers only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    onChange?.(fullCode);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (fullCode.length === length && !newDigits.includes('')) {
      onComplete?.(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const newDigits = Array(length).fill('');
    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    onChange?.(fullCode);

    const nextFocusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();

    if (fullCode.length === length && !newDigits.includes('')) {
      onComplete?.(fullCode);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between gap-2 sm:gap-3 w-full max-w-sm">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={cn(
              'h-12 w-12 text-center text-xl font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10 transition-all',
              error && 'border-red-400 focus:ring-red-100',
              disabled && 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
