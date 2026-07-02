'use client';

import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import {
  ArrowRightIcon,
  MoneyIcon,
  NoticeIcon,
  PakageIcon,
  SuccessIcon,
} from '@/src/assets/icon';

type Step = 'select-method' | 'validation-complete' | 'review';

// TODO: replace with real validated rows from upload
const reviewRows = {
  valid: [{ name: 'Rice (50kg bag)' }, { name: 'Cooking oil (5L)' }],
  resolved: [{ name: 'Sugar (1kg)', note: 'Auto-matched category' }],
  flagged: [{ name: 'Unknown item #4', note: 'Missing SKU' }],
};

export function BulkUploadTab() {
  const [step, setStep] = useState<Step>('select-method');

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 py-1 bg-[#ECFDF2] rounded-[4px] text-[#008360] font-medium text-xs flex justify-center">
            <p>3 Valid </p>
          </div>

          <div className="flex-1 py-1 bg-amber-lighter rounded-[4px] text-[#BB5902] font-medium text-xs flex justify-center">
            <p>2 flagged</p>
          </div>

          <div className="flex-1 py-1 bg-[#FEF3F2] rounded-[4px] text-[#B72B1E] font-medium text-xs flex justify-center">
            <p>1 Duplicate</p>
          </div>
        </div>

        <div className="px-3.5 py-4 bg-amber-lighter rounded-[10px] flex gap-3 items-start">
          <NoticeIcon className="text-[#BB5902]" width={45} />
          <p className="text-[#BB5902] font-medium text-sm">
            Resolve flagged rows inline or skip them. Duplicates are
            automatically skipped.
          </p>
        </div>

        <div>
          <p className="text-gray-950 text-sm font-medium mb-2">All rows (6)</p>
          <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
            <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    Sony WH-1000XM5
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0145 · Audio
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  ₦89,000
                </p>
                <p className="font-medium text-xs text-[#008360]">Valid</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    Sony WH-1000XM5
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0145 · Audio
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  ₦89,000
                </p>
                <p className="font-medium text-xs text-[#008360]">Valid</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    Sony WH-1000XM5
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0145 · Audio
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  ₦89,000
                </p>
                <p className="font-medium text-xs text-[#B72B1E]">Duplicate</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    Sony WH-1000XM5
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0145 · Audio
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  ₦89,000
                </p>
                <p className="font-medium text-xs text-[#A67102]">Flagged</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    Sony WH-1000XM5
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0145 · Audio
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  ₦89,000
                </p>
                <p className="font-medium text-xs text-[#A67102]">Flagged</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setStep('validation-complete')}
          >
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setStep('select-method')}
          >
            Import products
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'validation-complete') {
    return (
      <div className="flex flex-col items-center py-8 text-center h-full justify-between">
        <div className="flex flex-col gap-4 w-full">
          <div className="p-4 bg-bg-surface rounded-[16px] items-center flex flex-col w-full">
            <SuccessIcon width={120} />
            <h2 className="text-base font-semibold text-text-default">
              Validation complete
            </h2>
            <p className="text-sm font-medium text-text-helper">
              6 records found · 2 flagged · 1 duplicate
            </p>
          </div>

          <div className="flex justify-between gap-3 w-full">
            <div className="bg-bg-surface px-3 py-1.5 rounded-[10px] flex-1 flex flex-col items-center">
              <div className="bg-brand-lighter w-10 h-10 rounded-full justify-center items-center text-brand flex">
                <MoneyIcon width={28} />
              </div>
              <p className="text-text-helper text-sm font-medium">3 Valid</p>
            </div>

            <div className="bg-bg-surface px-3 py-1.5 rounded-[10px] flex-1 flex flex-col items-center">
              <div className="bg-brand-lighter w-10 h-10 rounded-full justify-center items-center text-brand flex">
                <MoneyIcon width={28} />
              </div>
              <p className="text-text-helper text-sm font-medium">2 Flagged</p>
            </div>

            <div className="bg-bg-surface px-3 py-1.5 rounded-[10px] flex-1 flex flex-col items-center">
              <div className="bg-brand-lighter w-10 h-10 rounded-full justify-center items-center text-brand flex">
                <MoneyIcon width={28} />
              </div>
              <p className="text-text-helper text-sm font-medium">
                1 duplicate
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-3 pt-4">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setStep('select-method')}
          >
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="button"
            className="flex gap-1"
            onClick={() => setStep('review')}
          >
            <Eye />
            Review & Import
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-3.5 py-4 bg-brand-lighter rounded-[10px] flex gap-3 items-start">
        <NoticeIcon className="text-brand" width={50} />
        <p className="text-brand font-medium text-sm">
          Add many products at once. Download the template to ensure correct
          formatting
        </p>
      </div>
      <p className="text-sm font-medium text-gray-950">Select upload method</p>

      <button
        type="button"
        onClick={() => setStep('validation-complete')}
        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left bg-bg-surface"
      >
        <FileSpreadsheet size={20} className="" />
        <div>
          <p className="text-sm font-medium text-neutral-900">CSV upload</p>
          <p className="text-xs text-text-subtle">
            Upload a CSV file from your device
          </p>
        </div>
        <ArrowRightIcon width={16} />
      </button>

      <button
        type="button"
        onClick={() => setStep('validation-complete')}
        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left bg-bg-surface"
      >
        <CloudUpload size={20} className="" />
        <div>
          <p className="text-sm font-medium text-neutral-900">Cloud import</p>
          <p className="text-xs text-text-subtle">
            Import from Google Sheets or Drive
          </p>
        </div>
        <ArrowRightIcon width={16} />
      </button>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-brand border-[1px] rounded-[10px] border-dashed border-brand"
      >
        <Download size={16} />
        Download CSV template
      </button>
    </div>
  );
}
