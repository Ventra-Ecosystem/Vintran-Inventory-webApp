'use client';

import { useState } from 'react';
import { customReportsApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

type Metric = 'revenue' | 'quantity';
type GroupBy = 'product' | 'channel' | 'staff' | 'day';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

export default function NumbersPage() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [metric, setMetric] = useState<Metric>('revenue');
  const [groupBy, setGroupBy] = useState<GroupBy>('product');
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runReport = async () => {
    setLoading(true);
    try {
      const res: any = await customReportsApi.run({ metric, groupBy, from, to });
      setResults(res.data?.rows ?? res.data ?? []);
      setRan(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to run report');
    } finally {
      setLoading(false);
    }
  };

  const metricOptions = [
    { label: 'Revenue', value: 'revenue' },
    { label: 'Quantity', value: 'quantity' },
  ];

  const groupByOptions = [
    { label: 'Product', value: 'product' },
    { label: 'Channel', value: 'channel' },
    { label: 'Staff', value: 'staff' },
    { label: 'Day', value: 'day' },
  ];

  return (
    <div className="space-y-5 pb-16">
      <h1 className="text-xl font-bold text-text-default">Custom Reports</h1>

      {/* Filters */}
      <div className="bg-bg-surface rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-text-default mb-1.5">Metric</p>
            <Dropdown
              options={metricOptions}
              value={metric}
              onChange={(v) => setMetric(v as Metric)}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-default mb-1.5">Group By</p>
            <Dropdown
              options={groupByOptions}
              value={groupBy}
              onChange={(v) => setGroupBy(v as GroupBy)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-text-default mb-1.5">From</p>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-default mb-1.5">To</p>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
        <Button fullWidth size="lg" disabled={loading} onClick={runReport}>
          {loading ? 'Running…' : 'Run Report'}
        </Button>
      </div>

      {/* Results */}
      {ran && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-default">
              Results ({results.length} row{results.length !== 1 ? 's' : ''})
            </p>
            <p className="text-xs text-text-muted">
              {metric === 'revenue' ? 'Revenue' : 'Quantity'} by {groupBy}
            </p>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-10 bg-bg-surface rounded-2xl">
              <p className="text-sm text-text-muted">No data for this period</p>
            </div>
          ) : (
            <div className="bg-bg-surface rounded-xl overflow-hidden">
              {results.map((row: any, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    'px-4 py-3 flex items-center justify-between',
                    idx < results.length - 1 ? 'border-b border-[#9B9EA34D]' : ''
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-default truncate">
                      {row.label ?? row.group ?? row.name ?? row.dimension ?? '—'}
                    </p>
                    {row.subLabel && (
                      <p className="text-xs text-text-muted">{row.subLabel}</p>
                    )}
                  </div>
                  <p className="text-sm font-bold text-text-default shrink-0 pl-4">
                    {metric === 'revenue'
                      ? fmt(row.value ?? row.revenue ?? row.total)
                      : String(row.value ?? row.quantity ?? row.count ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
