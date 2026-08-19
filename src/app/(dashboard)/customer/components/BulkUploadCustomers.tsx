'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { NoticeIcon } from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';

const CSV_TEMPLATE =
  "FirstName,LastName,PhoneNumber,Email,Address,Notes,CompanyName,Category\n" +
  "Jane,Doe,08012345678,,,,,Retail";

type RowFilter = 'All' | 'Valid' | 'Error';

export function BulkUploadCustomers() {
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<any>();
  const [rowFilter, setRowFilter] = useState<RowFilter>('All');
  const [isPending, setIsPending] = useState(false);

  // Mocking the behavior
  const storeId = 'store-123';

  const handlePreview = () => {
    if (!csv.trim() || !storeId) return;
    setIsPending(true);
    
    // Mock parsing and validation
    setTimeout(() => {
      const lines = csv.trim().split('\n').slice(1); // skip header
      const rows = lines.map((line, i) => {
        const cols = line.split(',');
        const ok = cols.length >= 3 && cols[0] && cols[1] && cols[2];
        return {
          lineNumber: i + 2,
          identifier: cols[0] ? `${cols[0]} ${cols[1] || ''}` : `Line ${i + 2}`,
          ok: !!ok,
          error: ok ? null : 'Missing required fields (FirstName, LastName, PhoneNumber)',
        };
      });

      setResult({
        dryRun: true,
        rows,
        imported: 0,
        skipped: 0,
      });
      setIsPending(false);
    }, 800);
  };

  const handleConfirm = () => {
    if (!csv.trim() || !storeId) return;
    setIsPending(true);
    
    setTimeout(() => {
      const validCount = result?.rows.filter((r: any) => r.ok).length || 0;
      const errorCount = result?.rows.filter((r: any) => !r.ok).length || 0;
      setResult({
        dryRun: false,
        imported: validCount,
        skipped: errorCount,
        rows: result.rows,
      });
      setIsPending(false);
    }, 1000);
  };

  const startOver = () => {
    setCsv('');
    setResult(undefined);
    setRowFilter('All');
  };

  // ── SUCCESS ─────────────────────────────────────────────────────────────
  if (result && !result.dryRun) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {result.imported} customer{result.imported === 1 ? '' : 's'} imported
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          {result.skipped} row{result.skipped === 1 ? '' : 's'} skipped
        </p>
        <Button onClick={startOver} size="lg" variant="primary">
          Import another file
        </Button>
      </div>
    );
  }

  // ── PREVIEW ─────────────────────────────────────────────────────────────
  if (result?.dryRun) {
    const errorCount = result.rows.filter((r: any) => !r.ok).length;
    const validCount = result.rows.filter((r: any) => r.ok).length;
    
    const filteredRows = result.rows.filter((r: any) => {
      if (rowFilter === 'Valid') return r.ok;
      if (rowFilter === 'Error') return !r.ok;
      return true;
    });

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview & Validate</h2>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 rounded-xl border-2 border-green-200 bg-white p-4">
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
              <p className="text-xs font-medium text-green-600 mt-1">Valid</p>
            </div>
            <div className="flex-1 rounded-xl border-2 border-red-200 bg-white p-4">
              <p className="text-2xl font-bold text-red-500">{errorCount}</p>
              <p className="text-xs font-medium text-red-500 mt-1">Flagged</p>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-3 mb-6">
              <NoticeIcon width={20} className="text-orange-600 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 leading-relaxed">
                {errorCount} row{errorCount === 1 ? '' : 's'} flagged — these will be skipped on import.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {(['All', 'Valid', 'Error'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRowFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold transition-colors",
                  rowFilter === tab ? "bg-brand text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {tab} ({tab === 'All' ? result.rows.length : tab === 'Valid' ? validCount : errorCount})
              </button>
            ))}
          </div>

          <div className="space-y-0 border-t border-gray-100">
            {filteredRows.map((row: any) => (
              <div key={row.lineNumber} className="flex items-start gap-3 py-4 border-b border-gray-100">
                {row.ok ? (
                  <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Line {row.lineNumber}{row.identifier ? ` · ${row.identifier}` : ''}
                  </p>
                  {row.error && <p className="text-xs text-red-500 mt-1">{row.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={startOver}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={validCount === 0 || isPending}
            onClick={handleConfirm}
          >
            {isPending ? 'Importing...' : `Import ${validCount} customer${validCount === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>
    );
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-start gap-3 bg-[#EFF5FF] rounded-xl p-4">
        <AlertCircle size={20} className="text-brand shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-brand leading-relaxed">
          Add multiple customers at once. Paste CSV rows with a header row — FirstName, LastName and PhoneNumber are required.
        </p>
      </div>

      <div>
        <button
          onClick={() => setCsv(CSV_TEMPLATE)}
          className="text-xs font-semibold text-brand hover:underline mb-2"
        >
          Insert template
        </button>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={CSV_TEMPLATE}
          className="w-full h-48 border border-gray-200 rounded-xl p-4 text-sm font-mono focus:border-brand focus:ring-2 focus:ring-primary-alpha-10 outline-none resize-none"
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!csv.trim() || !storeId || isPending}
        onClick={handlePreview}
      >
        {isPending ? 'Validating...' : 'Preview'}
      </Button>
    </div>
  );
}
