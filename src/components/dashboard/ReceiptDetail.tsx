import { PakageIcon } from '@/src/assets/icon';
import { ArrowLeft, ArrowRight, Printer, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReceiptDetailProps {
  title: string;
  type: string;
  details: { label: string; value: string }[];
}

export function ReceiptDetail({ title, type, details }: ReceiptDetailProps) {
  return (
    <main className="flex min-h-screen flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-text-helper font-medium text-[14px]">Refrence</p>
          <p className="text-black font-semibold text-lg">
            {(type === 'transferred' && 'TRF') ||
              (type === 'received' && 'RCV') ||
              (type === 'adjustments' && 'ADJ')}
            -2024-0041
          </p>
          <p className="text-text-helper font-normal text-[14px]">
            Today, 10:23 AM
          </p>
        </div>
        <div>
          {' '}
          <div className="bg-[#CBF5E5] rounded-full h-[16.6px] font-semibold text-[#176448] text-[9.6px] flex items-center justify-center px-1.5">
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
              <PakageIcon width={24} />
            </div>
            <div className="gap-1 flex flex-col">
              <p className="text-text-default font-semibold text-xs">{title}</p>
              <p className="text-text-muted font-medium text-[10px]">
                SKU-0041 · Smartphones
              </p>
            </div>
          </div>
        </div>
      </div>

      {type === 'received' && (
        <>
          <div className="rounded-[16px] p-4 bg-bg-surface">
            <p className="text-text-subtle font-semibold text-sm">
              Receipt Details
            </p>
            {details.map((d) => (
              <div
                key={d.label}
                className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0"
              >
                <span className="text-xs text-text-default font-medium ">
                  {d.label}
                </span>
                <span className="text-xs font-semibold text-subtle">
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] p-4 bg-bg-surface">
            <p className="text-text-subtle font-semibold text-sm">
              Location & logistics{' '}
            </p>
            {details.map((d) => (
              <div
                key={d.label}
                className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0"
              >
                <span className="text-xs text-text-default font-medium ">
                  {d.label}
                </span>
                <span className="text-xs font-semibold text-subtle">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {type === 'transferred' && (
        <div className="rounded-[16px] p-4 bg-bg-surface">
          <p className="text-text-subtle font-semibold text-sm">
            Transfer route
          </p>

          <div className="mt-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-white rounded-[8px]">
                <p className="font-semibold text-xs text-text-muted">From</p>
                <p className="text-text-default text-xs font-semibold">
                  Main Warehouse
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  20 units after
                </p>
              </div>

              <ArrowRight size={20} />

              <div className="flex-1 px-4 py-3 bg-[#ECF9FF] rounded-[8px]">
                <p className="font-semibold text-xs text-text-muted">To</p>
                <p className="text-text-default text-xs font-semibold">
                  Store A . VI
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  47 units after
                </p>
              </div>
            </div>

            <div className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0">
              <span className="text-xs text-text-default font-medium ">
                Qty transferred
              </span>
              <span className="text-xs font-semibold text-subtle">
                15 units
              </span>
            </div>

            <div className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0">
              <span className="text-xs text-text-default font-medium ">
                Qty transferred
              </span>
              <span className="text-xs font-semibold text-subtle">
                15 units
              </span>
            </div>
          </div>
        </div>
      )}

      {type === 'adjustments' && (
        <>
          <div className="rounded-[16px] p-4 bg-bg-surface">
            <p className="text-text-subtle font-semibold text-sm">
              Adjustments Details
            </p>
            {details.map((d) => (
              <div
                key={d.label}
                className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0"
              >
                <span className="text-xs text-text-default font-medium ">
                  {d.label}
                </span>
                <span className="text-xs font-semibold text-subtle">
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] p-4 bg-bg-surface">
            <p className="text-text-subtle font-semibold text-sm">Meta </p>
            {details.map((d) => (
              <div
                key={d.label}
                className="flex justify-between border-b border-[#9B9EA34D] py-3 last:border-0"
              >
                <span className="text-xs text-text-default font-medium ">
                  {d.label}
                </span>
                <span className="text-xs font-semibold text-subtle">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="p-4 rounded-[16px] bg-[#ECF9FF] flex flex-col gap-2">
        <p className="font-semibold text-sm text-text-subtle">Notes</p>
        <p className="text-text-default font-medium text-xs">
          All 20 units inspected on arrival. No visible damage. Packed in
          original manufacturer boxes.
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary-alpha-10 py-3 text-sm font-medium text-brand">
          Print
          <Printer size={16} />
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-brand py-3 text-sm font-medium text-white">
          Share
          <Share2 size={16} />
        </button>
      </div>
    </main>
  );
}
