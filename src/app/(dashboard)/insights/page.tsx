'use client';

import { useEffect, useState } from 'react';
import { reportsApi } from '@/src/lib/api/catalog';
import { salesApi, financeApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { PakageIcon, StoreIcon } from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

type ReportTab = 'inventory' | 'sales' | 'finance';

function StatRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#9B9EA34D] last:border-0">
      <p className="text-sm text-text-subtle">{label}</p>
      <p className={cn('text-sm font-semibold text-text-default', valueClass)}>{value}</p>
    </div>
  );
}

export default function InsightsPage() {
  const [tab, setTab] = useState<ReportTab>('inventory');
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [financeOverview, setFinanceOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    if (tab === 'inventory') {
      reportsApi.inventory()
        .then((res: any) => setInventoryReport(res.data ?? null))
        .catch((err: unknown) => {
          if (!(err instanceof ApiError && (err.status === 403 || err.status === 402))) console.error(err);
        })
        .finally(() => setLoading(false));
    } else if (tab === 'sales') {
      salesApi.getReport(monthStart, today)
        .then((res: any) => setSalesReport(res.data ?? null))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      financeApi.getOverview(monthStart, today)
        .then((res: any) => setFinanceOverview(res.data ?? null))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const TABS: { value: ReportTab; label: string }[] = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'sales', label: 'Sales' },
    { value: 'finance', label: 'Finance' },
  ];

  return (
    <div className="space-y-5 pb-16">
      <h1 className="text-xl font-bold text-text-default">Insights & Reports</h1>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'pb-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
              tab === t.value ? 'text-text-default border-brand' : 'text-text-helper border-transparent hover:text-text-subtle'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-muted text-sm">Loading report…</div>
      ) : (
        <>
          {/* Inventory Report */}
          {tab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-2xl font-bold text-text-default">{inventoryReport?.totalProductCount ?? 0}</p>
                  <p className="text-xs text-text-muted mt-1">Total Products</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-2xl font-bold text-amber-500">{inventoryReport?.lowStockProductCount ?? 0}</p>
                  <p className="text-xs text-text-muted mt-1">Low Stock Items</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-2xl font-bold text-red-500">{inventoryReport?.outOfStockProductCount ?? 0}</p>
                  <p className="text-xs text-text-muted mt-1">Out of Stock</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-2xl font-bold text-text-default">{inventoryReport?.deadStockProductCount ?? 0}</p>
                  <p className="text-xs text-text-muted mt-1">Dead Stock</p>
                </div>
              </div>

              <div className="bg-bg-surface rounded-xl px-4 py-2">
                <StatRow label="Stock value (cost)" value={fmt(inventoryReport?.estimatedStockValueAtCost)} valueClass="text-emerald-600" />
                <StatRow label="Total stock units" value={String(inventoryReport?.totalStockUnits ?? 0)} />
              </div>

              {(inventoryReport?.products ?? []).filter((p: any) => p.belowThreshold).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-default mb-3">Low Stock Products</p>
                  <div className="bg-bg-surface rounded-xl overflow-hidden">
                    {inventoryReport.products.filter((p: any) => p.belowThreshold).map((p: any, idx: number, arr: any[]) => (
                      <div key={p.productId ?? idx} className={`px-4 py-3 flex items-center justify-between ${idx < arr.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                        <div>
                          <p className="text-sm font-semibold text-text-default">{p.productName}</p>
                          <p className="text-xs text-text-muted">{p.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-500">{p.totalQuantity} left</p>
                          <p className="text-[10px] text-text-muted">threshold: {p.lowStockThreshold}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sales Report */}
          {tab === 'sales' && (
            <div className="space-y-4">
              <p className="text-xs text-text-muted">Month to date ({monthStart} → {today})</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-xl font-bold text-text-default">{fmt(salesReport?.totalRevenue)}</p>
                  <p className="text-xs text-text-muted mt-1">Total Revenue</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-xl font-bold text-emerald-600">{fmt(salesReport?.totalProfit)}</p>
                  <p className="text-xs text-text-muted mt-1">Gross Profit</p>
                </div>
              </div>
              <div className="bg-bg-surface rounded-xl px-4 py-2">
                <StatRow label="Total orders" value={String(salesReport?.totalOrders ?? 0)} />
                <StatRow label="Total units sold" value={String(salesReport?.totalUnitsSold ?? 0)} />
                <StatRow label="Total discounts" value={fmt(salesReport?.totalDiscount)} valueClass="text-red-500" />
                <StatRow label="Credit sales" value={fmt(salesReport?.creditSaleRevenue)} />
              </div>

              {(salesReport?.topProducts ?? []).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-default mb-3">Top Products</p>
                  <div className="bg-bg-surface rounded-xl overflow-hidden">
                    {salesReport.topProducts.map((p: any, idx: number) => (
                      <div key={p.productId ?? idx} className={`px-4 py-3 flex items-center justify-between ${idx < salesReport.topProducts.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                        <div>
                          <p className="text-sm font-semibold text-text-default">{p.productName}</p>
                          <p className="text-xs text-text-muted">{p.unitsSold} units sold</p>
                        </div>
                        <p className="text-sm font-bold text-text-default">{fmt(p.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finance Report */}
          {tab === 'finance' && (
            <div className="space-y-4">
              <p className="text-xs text-text-muted">Month to date ({monthStart} → {today})</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-xl font-bold text-emerald-600">{fmt(financeOverview?.totalIncome)}</p>
                  <p className="text-xs text-text-muted mt-1">Total Income</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-4">
                  <p className="text-xl font-bold text-red-500">{fmt(financeOverview?.totalExpenses)}</p>
                  <p className="text-xs text-text-muted mt-1">Total Expenses</p>
                </div>
              </div>
              <div className="bg-bg-surface rounded-xl px-4 py-2">
                <StatRow label="Net profit" value={fmt(financeOverview?.netProfit)} valueClass={financeOverview?.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'} />
                <StatRow label="Open debts" value={fmt(financeOverview?.openDebts)} valueClass="text-red-500" />
                <StatRow label="Recovered debts" value={fmt(financeOverview?.recoveredDebts)} valueClass="text-emerald-600" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
