'use client';

import { useRef, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  ChevronLeft,
  Eye,
  AlertCircle,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { NoticeIcon } from '@/src/assets/icon';
import { productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

type Step = 'select-method' | 'validation-complete' | 'review';

interface ValidationResult {
  valid: number;
  flagged: number;
  duplicates: number;
  rows: { name: string; sku?: string; status: 'valid' | 'flagged' | 'duplicate'; reason?: string }[];
}

const CSV_TEMPLATE_HEADER = 'name,sku,category,subcategory,unitOfMeasure,lowStockThreshold,channels';
const CSV_TEMPLATE_ROW = 'My Product,SKU-001,Electronics,,unit,5,InStore';
const CSV_TEMPLATE = CSV_TEMPLATE_HEADER + '\n' + CSV_TEMPLATE_ROW;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvPreview(csv: string): ValidationResult {
  const lines = csv.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return { valid: 0, flagged: 0, duplicates: 0, rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const skuIdx = headers.indexOf('sku');

  const seen = new Set<string>();
  const rows: ValidationResult['rows'] = [];

  lines.slice(1).forEach((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const name = cols[nameIdx] ?? '';
    const sku = skuIdx >= 0 ? cols[skuIdx] : undefined;

    if (!name) {
      rows.push({ name: 'Unknown', sku, status: 'flagged', reason: 'Missing name' });
      return;
    }
    const key = sku || name;
    if (seen.has(key)) {
      rows.push({ name, sku, status: 'duplicate', reason: 'Duplicate SKU' });
      return;
    }
    seen.add(key);
    if (!sku) {
      rows.push({ name, sku, status: 'flagged', reason: 'Missing SKU' });
      return;
    }
    rows.push({ name, sku, status: 'valid' });
  });

  return {
    valid: rows.filter((r) => r.status === 'valid').length,
    flagged: rows.filter((r) => r.status === 'flagged').length,
    duplicates: rows.filter((r) => r.status === 'duplicate').length,
    rows,
  };
}

export function BulkUploadTab() {
  const [step, setStep] = useState<Step>('select-method');
  const [csvContent, setCsvContent] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvContent(text);
      const result = parseCsvPreview(text);
      setValidation(result);
      setStep('validation-complete');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent || !validation) return;
    setImporting(true);
    try {
      await productsApi.bulkUpload(csvContent, true);
      await productsApi.bulkUpload(csvContent, false);
      setImportDone(true);
      toast.success(validation.valid + ' product(s) imported successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const closeModal = () => {
    setStep('select-method');
    setCsvContent('');
    setValidation(null);
    setImportDone(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="px-3.5 py-4 bg-brand-lighter rounded-[10px] flex gap-3 items-start">
        <NoticeIcon className="text-brand shrink-0 mt-0.5" width={24} />
        <p className="text-brand font-medium text-sm leading-relaxed">
          Add many products at once. Download the template to ensure correct formatting.
        </p>
      </div>
      <p className="text-sm font-medium text-text-default">Select upload method</p>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
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
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-medium text-brand border rounded-[10px] border-dashed border-brand/30 hover:bg-brand-lighter/50 transition-colors bg-brand-lighter/10"
        onClick={downloadTemplate}
      >
        <Download size={16} />
        Download CSV Template
      </button>

      <Modal isOpen={step !== 'select-method'} onClose={closeModal}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-default">Bulk Upload</h2>
            <button type="button" onClick={closeModal} className="text-text-muted hover:text-text-subtle p-1">
              <ChevronLeft size={20} />
            </button>
          </div>

          {importDone ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-default">Import Complete!</h3>
              <p className="text-sm text-text-subtle">{validation?.valid} product(s) added to your catalogue.</p>
              <Button fullWidth size="lg" onClick={closeModal}>Done</Button>
            </div>
          ) : step === 'validation-complete' && validation ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="py-10 px-4 bg-bg-surface rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-text-default mb-1.5">Validation complete</h3>
                  <p className="text-sm font-medium text-text-subtle">
                    {validation.valid + validation.flagged + validation.duplicates} records found
                    {validation.flagged > 0 ? ' · ' + validation.flagged + ' flagged' : ''}
                    {validation.duplicates > 0 ? ' · ' + validation.duplicates + ' duplicate' : ''}
                  </p>
                </div>
                <div className="flex justify-between gap-3 mt-2">
                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs font-semibold text-text-default">{validation.valid} Valid</p>
                  </div>
                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs font-semibold text-text-default">{validation.flagged} Flagged</p>
                  </div>
                  <div className="bg-bg-surface px-2 py-4 rounded-xl flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs font-semibold text-text-default">{validation.duplicates} Duplicate</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <Button variant="secondary" className="bg-brand-lighter text-brand flex-1" size="lg" type="button" onClick={closeModal}>Back</Button>
                <Button variant="primary" className="flex-1 flex gap-2 items-center justify-center" size="lg" type="button" onClick={() => setStep('review')}>
                  <Eye size={18} />Review &amp; Import
                </Button>
              </div>
            </div>
          ) : step === 'review' && validation ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-6">
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 py-1.5 bg-emerald-50 rounded-md text-emerald-600 font-medium text-[11px] text-center">{validation.valid} Valid</div>
                  <div className="flex-1 py-1.5 bg-amber-50 rounded-md text-amber-600 font-medium text-[11px] text-center">{validation.flagged} Flagged</div>
                  <div className="flex-1 py-1.5 bg-red-50 rounded-md text-red-500 font-medium text-[11px] text-center">{validation.duplicates} Duplicate</div>
                </div>

                {validation.flagged > 0 && (
                  <div className="px-3.5 py-3 mb-5 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-amber-800 font-medium text-xs leading-relaxed">
                      Resolve flagged rows inline or skip them. Duplicates are automatically skipped.
                    </p>
                  </div>
                )}

                <p className="text-text-default text-sm font-bold mb-3">All rows ({validation.rows.length})</p>
                <div className="bg-bg-surface rounded-xl overflow-hidden border border-gray-100 mb-6">
                  {validation.rows.map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 bg-white">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className={cn('w-8 h-8 rounded-full flex justify-center items-center shrink-0',
                          row.status === 'valid' ? 'border border-emerald-200 text-emerald-500'
                          : row.status === 'duplicate' ? 'bg-red-50 text-red-500'
                          : 'bg-amber-50 text-amber-500'
                        )}>
                          {row.status === 'valid' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-text-default font-bold text-xs truncate">{row.name}</p>
                          <p className="text-text-muted font-medium text-[10px] mt-0.5 truncate">
                            {row.sku ?? 'No SKU'}{row.reason ? ' · ' + row.reason : ''}
                          </p>
                        </div>
                      </div>
                      <p className={cn('font-semibold text-[10px] shrink-0 pl-3',
                        row.status === 'valid' ? 'text-emerald-500'
                        : row.status === 'duplicate' ? 'text-red-500'
                        : 'text-amber-500'
                      )}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 bg-white shrink-0 pb-2">
                <Button variant="secondary" className="bg-brand-lighter text-brand flex-1" size="lg" type="button" onClick={() => setStep('validation-complete')}>Back</Button>
                <Button
                  variant="primary"
                  className="flex-[2] items-center justify-center flex gap-2"
                  size="lg"
                  type="button"
                  disabled={importing || validation.valid === 0}
                  onClick={handleImport}
                >
                  <Upload size={18} />
                  {importing ? 'Importing…' : 'Import ' + validation.valid + ' product' + (validation.valid !== 1 ? 's' : '')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
