'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Download } from 'lucide-react';
import { customersApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr, cn } from '@/src/lib/utils';

const CSV_TEMPLATE =
  'FirstName,LastName,PhoneNumber,Email,Address,Notes,CompanyName,Category\n' +
  'Jane,Doe,08012345678,,,,,Retail';

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customers-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

type RowFilter = 'All' | 'Valid' | 'Error';

export function BulkUploadCustomers() {
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<any>(null);
  const [rowFilter, setRowFilter] = useState<RowFilter>('All');
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    locationsApi.list().then((res: any) => {
      const locs = toArr(res.data).filter((l: any) => l.kind === 'Store' || l.kind === 'Both');
      setStores(locs);
      if (locs.length > 0) setStoreId(locs[0].id);
    }).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsv(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    if (!csv.trim() || !storeId) return;
    setIsPending(true);
    try {
      const res: any = await customersApi.bulkImport({ csv: csv.trim() }, storeId, true);
      setResult(res.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Validation failed');
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirm = async () => {
    if (!csv.trim() || !storeId) return;
    setIsPending(true);
    try {
      const res: any = await customersApi.bulkImport({ csv: csv.trim() }, storeId, false);
      setResult(res.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Import failed');
    } finally {
      setIsPending(false);
    }
  };

  const startOver = () => {
    setCsv('');
    setResult(null);
    setRowFilter('All');
    if (fileRef.current) fileRef.current.value = '';
  };

  const rows: any[] = result?.rows ?? [];
  const validCount = rows.filter(r => r.ok).length;
  const errorCount = rows.filter(r => !r.ok).length;
  const filteredRows = rows.filter(r => rowFilter === 'Valid' ? r.ok : rowFilter === 'Error' ? !r.ok : true);

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (result && !result.dryRun) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-[#0A0D14] mb-2">
          {result.imported} customer{result.imported === 1 ? '' : 's'} imported
        </h2>
        <p className="text-sm text-text-muted mb-8">
          {result.skipped} row{result.skipped === 1 ? '' : 's'} skipped
        </p>
        <button type="button" onClick={startOver} className="h-12 px-8 rounded-xl bg-brand text-white font-semibold text-sm">
          Import another file
        </button>
      </div>
    );
  }

  // ── PREVIEW (dry run) ──────────────────────────────────────────────────────
  if (result?.dryRun) {
    return (
      <div className="space-y-4 pb-12">
        <h2 className="text-base font-bold text-[#0A0D14]">Preview &amp; Validate</h2>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border-2 border-emerald-200 p-4">
            <p className="text-2xl font-bold text-emerald-600">{validCount}</p>
            <p className="text-xs font-medium text-emerald-600 mt-0.5">Valid</p>
          </div>
          <div className="flex-1 rounded-xl border-2 border-red-200 p-4">
            <p className="text-2xl font-bold text-red-500">{errorCount}</p>
            <p className="text-xs font-medium text-red-500 mt-0.5">Flagged</p>
          </div>
        </div>

        {/* Store picker (if multiple) */}
        {stores.length > 1 && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Import into store</label>
            <select value={storeId} onChange={e => setStoreId(e.target.value)} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white">
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* Warning */}
        {errorCount > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              {errorCount} row{errorCount === 1 ? '' : 's'} flagged — these will be skipped on import.
            </p>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2">
          {([
            { key: 'All', count: rows.length },
            { key: 'Valid', count: validCount },
            { key: 'Error', count: errorCount },
          ] as { key: RowFilter; count: number }[]).map(({ key, count }) => (
            <button key={key} type="button" onClick={() => setRowFilter(key)} className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition-colors', rowFilter === key ? 'bg-brand text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200')}>
              {key} ({count})
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-0 border-t border-gray-100 max-h-72 overflow-y-auto">
          {filteredRows.map((row: any) => (
            <div key={row.lineNumber} className="flex items-start gap-3 py-3 border-b border-gray-100">
              {row.ok
                ? <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                : <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-semibold text-[#0A0D14]">
                  Line {row.lineNumber}{row.identifier ? ` · ${row.identifier}` : ''}
                </p>
                {row.error && <p className="text-xs text-red-500 mt-0.5">{row.error}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={validCount === 0 || isPending}
            className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? 'Importing…' : `Import ${validCount} customer${validCount === 1 ? '' : 's'}`}
          </button>
          <button type="button" onClick={startOver} className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#64748B] font-semibold text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-12">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-[#EFF5FF] rounded-xl p-4">
        <AlertCircle size={16} className="text-brand shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-brand leading-relaxed">
          Add multiple customers at once. Paste CSV rows with a header row — FirstName, LastName and PhoneNumber are required.
        </p>
      </div>

      {/* No store warning */}
      {!storeId && (
        <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600">No store location found — create one first to import customers.</p>
        </div>
      )}

      {/* Store selector */}
      {stores.length > 1 && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0A0D14]">Target store</label>
          <select value={storeId} onChange={e => setStoreId(e.target.value)} className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white">
            {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Upload + Template row */}
      <div className="flex gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-brand text-brand text-sm font-semibold hover:bg-brand-lighter transition-colors">
          Upload CSV
        </button>
        <button type="button" onClick={downloadTemplate} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-text-muted text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download size={14} /> Template
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Insert template link */}
      <button type="button" onClick={() => setCsv(CSV_TEMPLATE)} className="text-xs font-semibold text-brand hover:underline -mt-2">
        Insert template
      </button>

      {/* CSV textarea */}
      <textarea
        value={csv}
        onChange={e => setCsv(e.target.value)}
        placeholder={CSV_TEMPLATE}
        className="w-full min-h-[180px] border border-gray-200 rounded-xl p-4 text-sm font-mono focus:border-brand focus:ring-2 focus:ring-primary-alpha-10 outline-none resize-none placeholder:text-[#94A3B8]"
      />

      {/* Preview button */}
      <button
        type="button"
        onClick={handlePreview}
        disabled={!csv.trim() || !storeId || isPending}
        className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50"
      >
        {isPending ? 'Validating…' : 'Preview'}
      </button>
    </div>
  );
}
