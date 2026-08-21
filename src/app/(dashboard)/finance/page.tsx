'use client';

import { useState, useEffect, useMemo } from 'react';
import { financeApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  TrendingUp,
  ShoppingCart,
  PieChart,
  FileText,
  DollarSign,
  User,
  Home,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
  Info,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

const TABS = ['Overview', 'Ledger', 'Expenses', 'Balancing'] as const;
type MainTab = (typeof TABS)[number];

const EXPENSE_CATEGORIES = [
  'All',
  'Rent',
  'Utilities',
  'Transport',
  'RunningCosts',
  'Delivery',
  'Marketing',
  'Supplies',
  'Repairs',
  'Other',
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n: number = 0) {
  return `₦${n.toLocaleString()}`;
}

export default function FinancePage() {
  const [mainTab, setMainTab] = useState<MainTab>('Overview');
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(todayIso());

  // Data State
  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const [openDebts, setOpenDebts] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<string>('');

  // Add Expense State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Rent');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [expenseNotes, setExpenseNotes] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('All');

  // Load locations for storeId
  useEffect(() => {
    locationsApi
      .list()
      .then((res: any) => {
        const list = res.data ?? res ?? [];
        const store = list.find((l: any) => l.kind === 'Store') || list[0];
        if (store) setStoreId(store.id);
      })
      .catch(() => {});
  }, []);

  // Fetch Overview Data
  const fetchOverview = () => {
    setOverviewLoading(true);
    financeApi
      .getOverview(from, to)
      .then((res: any) => setOverview(res.data ?? res))
      .catch(() => {})
      .finally(() => setOverviewLoading(false));
  };

  // Fetch Ledger Data
  const fetchLedger = () => {
    setLedgerLoading(true);
    financeApi
      .getLedger({ from, to })
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setLedgerEntries(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setLedgerEntries([]))
      .finally(() => setLedgerLoading(false));
  };

  // Fetch Open Debts
  useEffect(() => {
    financeApi
      .getOpenDebts()
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setOpenDebts(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setOpenDebts([]));
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchLedger();
  }, [from, to]);

  // Expense filtered items
  const expenseEntries = useMemo(() => {
    return ledgerEntries
      .filter((e) => e.referenceType === 'Expense' || e.eventDescription?.includes('Expense'))
      .map((e) => {
        let category = 'Other';
        if (e.eventDescription === 'Delivery cost incurred') category = 'Delivery';
        const match = e.eventDescription?.match(/Expense recorded \((\w+)\)/);
        if (match?.[1]) category = match[1];
        return { ...e, category };
      });
  }, [ledgerEntries]);

  const filteredExpenses = useMemo(() => {
    return expenseEntries.filter(
      (e) => expenseFilter === 'All' || e.category === expenseFilter
    );
  }, [expenseEntries, expenseFilter]);

  const totalExpensesInPeriod = useMemo(() => {
    return expenseEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenseEntries]);

  // Ledger calculation
  const totalLedgerBalance = useMemo(
    () => ledgerEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    [ledgerEntries]
  );

  const accountCount = useMemo(
    () => new Set(ledgerEntries.flatMap((e) => [e.debitAccount, e.creditAccount])).size,
    [ledgerEntries]
  );

  const filteredLedger = useMemo(() => {
    if (!ledgerSearch.trim()) return ledgerEntries;
    const q = ledgerSearch.toLowerCase();
    return ledgerEntries.filter(
      (e) =>
        e.eventDescription?.toLowerCase().includes(q) ||
        e.debitAccount?.toLowerCase().includes(q) ||
        e.creditAccount?.toLowerCase().includes(q)
    );
  }, [ledgerEntries, ledgerSearch]);

  // Balancing totals
  const debitTotals = useMemo(() => {
    const m = new Map<string, number>();
    ledgerEntries.forEach((e) => m.set(e.debitAccount, (m.get(e.debitAccount) ?? 0) + (e.amount || 0)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [ledgerEntries]);

  const creditTotals = useMemo(() => {
    const m = new Map<string, number>();
    ledgerEntries.forEach((e) => m.set(e.creditAccount, (m.get(e.creditAccount) ?? 0) + (e.amount || 0)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [ledgerEntries]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !storeId) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmittingExpense(true);
    try {
      await financeApi.createExpense(
        {
          category: expenseCategory,
          amount: Number(expenseAmount),
          incurredOn: expenseDate,
          notes: expenseNotes.trim() || undefined,
        },
        storeId
      );
      toast.success('Expense recorded successfully');
      setShowAddExpense(false);
      setExpenseAmount('');
      setExpenseNotes('');
      fetchLedger();
      fetchOverview();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0D14]">Finance & Accounting</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Double-entry ledger, expense tracking, and profit loss statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="h-10 px-4 rounded-xl bg-brand text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Date Range Bar */}
      <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#64748B]" />
          <span className="text-xs font-semibold text-[#0A0D14]">Period:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-3 text-xs font-medium border border-[#E2E8F0] rounded-xl bg-white text-[#0A0D14]"
          />
          <span className="text-xs text-[#94A3B8]">–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-3 text-xs font-medium border border-[#E2E8F0] rounded-xl bg-white text-[#0A0D14]"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-[#F1F5F9]">
        <div className="flex gap-8">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMainTab(t)}
              className={cn(
                'py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                mainTab === t ? 'text-[#0055FF]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {mainTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Overview Tab ── */}
      {mainTab === 'Overview' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Performance Summary
          </p>

          {overviewLoading ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading summary...</div>
          ) : (
            <>
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF5FF] flex items-center justify-center text-[#0055FF] mb-3">
                    <TrendingUp size={16} />
                  </div>
                  <p className="text-xs text-[#64748B]">Total Revenue</p>
                  <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(overview?.totalRevenue)}</p>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF9C3] flex items-center justify-center text-[#D97706] mb-3">
                    <ShoppingCart size={16} />
                  </div>
                  <p className="text-xs text-[#64748B]">Total COGS</p>
                  <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(overview?.totalCogs)}</p>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] mb-3">
                    <PieChart size={16} />
                  </div>
                  <p className="text-xs text-[#64748B]">Gross Profit</p>
                  <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(overview?.grossProfit)}</p>
                  {overview?.totalRevenue > 0 && (
                    <p className="text-[11px] font-semibold text-[#16A34A] mt-1">
                      Margin: {((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] mb-3">
                    <FileText size={16} />
                  </div>
                  <p className="text-xs text-[#64748B]">Total Expenses</p>
                  <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(overview?.totalExpenses)}</p>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF5FF] flex items-center justify-center text-[#0055FF] mb-3">
                    <DollarSign size={16} />
                  </div>
                  <p className="text-xs text-[#64748B]">Net Profit</p>
                  <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(overview?.netProfit)}</p>
                  {overview?.totalRevenue > 0 && (
                    <p className="text-[11px] font-semibold text-[#16A34A] mt-1">
                      Margin: {((overview.netProfit / overview.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Receivables vs Payables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-[#EA580C]" />
                    <p className="text-xs font-bold text-[#0A0D14]">Accounts Receivable</p>
                  </div>
                  <p className="text-xl font-bold text-[#EA580C] mt-2">
                    {fmt(overview?.outstandingReceivables)}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {openDebts.length} customer debts open
                  </p>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={16} className="text-[#EF4444]" />
                    <p className="text-xs font-bold text-[#0A0D14]">Accounts Payable</p>
                  </div>
                  <p className="text-xl font-bold text-[#EF4444] mt-2">
                    {fmt(overview?.outstandingPayables)}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">Outstanding supplier payables</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 2. Ledger Tab ── */}
      {mainTab === 'Ledger' && (
        <div className="space-y-6">
          <div className="bg-[#EFF5FF] border border-[#0055FF]/10 rounded-2xl p-4 flex items-center gap-3 text-[#0055FF] text-xs font-medium">
            <Info size={18} className="shrink-0" />
            <span>
              Each financial event posts a balanced double-entry to keep your general ledger accurate.
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <p className="text-xs text-[#64748B]">Total Posted</p>
              <p className="text-lg font-bold text-[#0A0D14] mt-1">{fmt(totalLedgerBalance)}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <p className="text-xs text-[#64748B]">Transactions</p>
              <p className="text-lg font-bold text-[#0A0D14] mt-1">{ledgerEntries.length}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <p className="text-xs text-[#64748B]">Active Accounts</p>
              <p className="text-lg font-bold text-[#0A0D14] mt-1">{accountCount}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search event description, debit or credit account..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8]"
            />
          </div>

          {/* Journal Entries Table */}
          {ledgerLoading ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading journal entries...</div>
          ) : filteredLedger.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#94A3B8]">No ledger entries found</div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Event Description</th>
                    <th className="py-3 px-4">Debit Account</th>
                    <th className="py-3 px-4">Credit Account</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredLedger.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedEntry(item)}
                      className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-[#0A0D14]">
                        {item.eventDescription}
                      </td>
                      <td className="py-3 px-4 text-[#334155]">{item.debitAccount}</td>
                      <td className="py-3 px-4 text-[#64748B]">{item.creditAccount}</td>
                      <td className="py-3 px-4 font-bold text-[#0A0D14] text-right">
                        {fmt(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Expenses Tab ── */}
      {mainTab === 'Expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-5">
              <p className="text-xs text-[#64748B]">Total Expenses In Period</p>
              <p className="text-2xl font-bold text-[#EF4444] mt-1">
                {fmt(totalExpensesInPeriod)}
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-5">
              <p className="text-xs text-[#64748B]">Expense Records</p>
              <p className="text-2xl font-bold text-[#0A0D14] mt-1">{expenseEntries.length}</p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setExpenseFilter(cat)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors',
                  expenseFilter === cat
                    ? 'bg-[#0055FF] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expense List */}
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#94A3B8]">No expenses recorded</div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9] shadow-sm">
              {filteredExpenses.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A0D14]">{item.category}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(item.occurredOnUtc).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#0A0D14]">{fmt(item.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Balancing Tab ── */}
      {mainTab === 'Balancing' && (
        <div className="space-y-6">
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-center gap-3 text-[#16A34A] text-sm font-semibold">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Books are balanced. Total Debits match Total Credits.</span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0A0D14]">Trial Balance Summary</h3>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B]">Total Debits</span>
              <span className="text-base font-bold text-[#0A0D14]">{fmt(totalLedgerBalance)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-[#64748B]">Total Credits</span>
              <span className="text-base font-bold text-[#0A0D14]">{fmt(totalLedgerBalance)}</span>
            </div>
          </div>

          {/* Account breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-[#0A0D14] mb-3">By Debit Account</h4>
              <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9] shadow-sm">
                {debitTotals.map(([account, total]) => (
                  <div key={account} className="p-3.5 flex justify-between text-xs">
                    <span className="text-[#334155]">{account}</span>
                    <span className="font-semibold text-[#0A0D14]">{fmt(total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0A0D14] mb-3">By Credit Account</h4>
              <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9] shadow-sm">
                {creditTotals.map(([account, total]) => (
                  <div key={account} className="p-3.5 flex justify-between text-xs">
                    <span className="text-[#64748B]">{account}</span>
                    <span className="font-semibold text-[#0A0D14]">{fmt(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Expense Modal ── */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A0D14]">Add Expense</h2>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="text-[#94A3B8] hover:text-[#0A0D14]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0D14] mb-1">
                  Expense Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14]"
                >
                  {EXPENSE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount (₦) *"
                type="number"
                value={expenseAmount}
                placeholder="0.00"
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />

              <Input
                label="Date *"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#0A0D14] mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] h-24"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowAddExpense(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={submittingExpense}>
                  {submittingExpense ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Entry Detail Modal ── */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Journal Entry Detail</h2>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-[#94A3B8] hover:text-[#0A0D14]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-[#F1F5F9] text-xs">
              <div className="py-2">
                <p className="text-[#64748B]">Event Description</p>
                <p className="font-bold text-[#0A0D14] text-sm mt-0.5">
                  {selectedEntry.eventDescription}
                </p>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Amount</span>
                <span className="font-bold text-[#0A0D14]">{fmt(selectedEntry.amount)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Debit Account</span>
                <span className="font-semibold text-[#0A0D14]">{selectedEntry.debitAccount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Credit Account</span>
                <span className="font-semibold text-[#0A0D14]">{selectedEntry.creditAccount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Reference Type</span>
                <span className="font-semibold text-[#0A0D14]">
                  {selectedEntry.referenceType || 'Manual'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="font-semibold text-[#0A0D14]">
                  {new Date(selectedEntry.occurredOnUtc).toLocaleString()}
                </span>
              </div>
            </div>

            <Button fullWidth variant="secondary" onClick={() => setSelectedEntry(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
