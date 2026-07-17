'use client';

import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CloudUpload,
  ChevronLeft,
  Eye,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { NoticeIcon } from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';

type Step = 'select-method' | 'validation-complete' | 'review';

export function BulkUploadTab() {
  const [step, setStep] = useState<Step>('select-method');

  const closeModal = () => {
    setStep('select-method');
  };

  return (
    <div className="space-y-4">
      {/* ── Main Tab Content ── */}
      <div className="px-3.5 py-4 bg-brand-lighter rounded-[10px] flex gap-3 items-start">
        <NoticeIcon className="text-brand flex-shrink-0 mt-0.5" width={24} />
        <p className="text-brand font-medium text-sm leading-relaxed">
          Add many products at once. Download the template to ensure correct formatting
        </p>
      </div>
      <p className="text-sm font-medium text-text-default">Select upload method</p>

      <button
        type="button"
        onClick={() => setStep('validation-complete')}
        className="flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left bg-bg-surface hover:bg-gray-100 transition-colors"
      >
        <div className="text-text-muted flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
          <FileSpreadsheet size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-default">CSV Upload</p>
          <p className="text-xs text-text-subtle">Download template - Fill in - Upload from device</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setStep('validation-complete')}
        className="flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left bg-bg-surface hover:bg-gray-100 transition-colors"
      >
        <div className="text-text-muted flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
          <CloudUpload size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-default">Cloud Import</p>
          <p className="text-xs text-text-subtle">Connect Google Drive, Dropbox or Box</p>
        </div>
      </button>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-medium text-brand border rounded-[10px] border-dashed border-brand/30 hover:bg-brand-lighter/50 transition-colors bg-brand-lighter/10"
      >
        <Download size={16} />
        Download CSV Template
      </button>

      {/* ── Side Drawer Modal ── */}
      <Modal isOpen={step !== 'select-method'} onClose={closeModal}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-default">Bulk Upload</h2>
            <button
              type="button"
              onClick={closeModal}
              className="text-text-muted hover:text-text-subtle p-1"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* ── Validation Complete Step ── */}
          {step === 'validation-complete' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="py-10 px-4 bg-bg-surface rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-sm relative">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-text-default mb-1.5">
                    Validation complete
                  </h3>
                  <p className="text-sm font-medium text-text-subtle">
                    6 records found · 2 flagged · 1 duplicate
                  </p>
                </div>

                <div className="flex justify-between gap-3 mt-2">
                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center min-h-[96px]">
                    <div className="text-brand mb-2">
                      <FileSpreadsheet size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-semibold text-text-default">3 Valid</p>
                  </div>

                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center min-h-[96px]">
                    <div className="text-brand mb-2">
                      <FileSpreadsheet size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-semibold text-text-default">2 Flagged</p>
                  </div>

                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center min-h-[96px]">
                    <div className="text-brand mb-2">
                      <FileSpreadsheet size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-semibold text-text-default">1 Duplicate</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4">
                <Button
                  variant="secondary"
                  className="bg-brand-lighter text-brand flex-1"
                  size="lg"
                  type="button"
                  onClick={closeModal}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 flex gap-2 items-center justify-center"
                  size="lg"
                  type="button"
                  onClick={() => setStep('review')}
                >
                  <Eye size={18} />
                  Review & Import
                </Button>
              </div>
            </div>
          )}

          {/* ── Review Step ── */}
          {step === 'review' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-6 relative">
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 py-1.5 bg-emerald-50 rounded-md text-emerald-600 font-medium text-[11px] text-center">
                    3 Valid
                  </div>
                  <div className="flex-1 py-1.5 bg-amber-50 rounded-md text-amber-600 font-medium text-[11px] text-center">
                    2 Flagged
                  </div>
                  <div className="flex-1 py-1.5 bg-red-50 rounded-md text-error-dark font-medium text-[11px] text-center">
                    1 Duplicate
                  </div>
                </div>

                <div className="px-3.5 py-3 mb-5 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-amber-800 font-medium text-xs leading-relaxed">
                    Resolve flagged rows inline or skip them. Duplicates are automatically skipped.
                  </p>
                </div>

                <p className="text-text-default text-sm font-bold mb-3">All rows (6)</p>
                <div className="bg-bg-surface rounded-xl overflow-hidden border border-gray-100 mb-6">
                  {/* Row 1 - Valid */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200/60 bg-white">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-8 h-8 rounded-full border border-emerald-200 text-emerald-500 flex justify-center items-center flex-shrink-0 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-default font-bold text-xs truncate">Sony WH-1000XM5</p>
                        <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">SKU-0145 · Audio</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
                      <p className="text-text-default text-xs font-bold">₦89,000</p>
                      <p className="font-semibold text-[10px] text-emerald-500">Valid</p>
                    </div>
                  </div>

                  {/* Row 2 - Valid */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200/60 bg-white">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-8 h-8 rounded-full border border-emerald-200 text-emerald-500 flex justify-center items-center flex-shrink-0 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-default font-bold text-xs truncate">Sony WH-1000XM5</p>
                        <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">SKU-0145 · Audio</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
                      <p className="text-text-default text-xs font-bold">₦89,000</p>
                      <p className="font-semibold text-[10px] text-emerald-500">Valid</p>
                    </div>
                  </div>

                  {/* Row 3 - Duplicate */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200/60 bg-white">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-error-dark flex justify-center items-center flex-shrink-0 shrink-0">
                        <FileSpreadsheet size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-default font-bold text-xs truncate">Samsung Galaxy A54 64GB</p>
                        <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">Duplicate SKU</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
                      <p className="text-text-default text-xs font-bold">₦89,000</p>
                      <p className="font-semibold text-[10px] text-error-dark">Duplicate</p>
                    </div>
                  </div>

                  {/* Row 4 - Flagged */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200/60 bg-white">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex justify-center items-center flex-shrink-0 shrink-0">
                        <AlertCircle size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-default font-bold text-xs truncate">Anker USB-C Hub 7-in-1</p>
                        <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">Missing SKU</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
                      <p className="text-text-default text-xs font-bold">₦89,000</p>
                      <p className="font-semibold text-[10px] text-amber-500">Flagged</p>
                    </div>
                  </div>

                  {/* Row 5 - Flagged */}
                  <div className="flex justify-between items-center p-3 bg-white">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex justify-center items-center flex-shrink-0 shrink-0">
                        <AlertCircle size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-default font-bold text-xs truncate">Anker USB-C Hub 7-in-1</p>
                        <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">Missing SKU</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-3">
                      <p className="text-text-default text-xs font-bold">₦89,000</p>
                      <p className="font-semibold text-[10px] text-amber-500">Flagged</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 bg-white shrink-0 pb-2">
                <Button
                  variant="secondary"
                  className="bg-brand-lighter text-brand flex-1"
                  size="lg"
                  type="button"
                  onClick={() => setStep('validation-complete')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-[2] items-center justify-center flex gap-2"
                  size="lg"
                  type="button"
                  onClick={closeModal}
                >
                  <Upload size={18} />
                  Import 3 products
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
