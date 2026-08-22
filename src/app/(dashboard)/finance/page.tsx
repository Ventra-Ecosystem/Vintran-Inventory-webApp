'use client';

import { useState, useEffect, useMemo } from 'react';
import { financeApi } from '@/src/lib/api/commerce';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
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
  CheckCircle,
  Calendar,
  X,
  ChevronRight,
  Info,
  ArrowLeft,
  Tag,
  Briefcase,
  Repeat,
  Book,
} from 'lucide-react';

const BLUE = '#0055FF';
const GREEN = '#16A34A';
const RED = '#EF4444';
const AMBER = '#D97706';

const TABS = ['Overview', 'Ledger', 'Expenses', 'Balancing'] as const;
type MainTab = (typeof TABS)[number];

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Transport', 'RunningCosts',
  'Delivery', 'Marketing', 'Supplies', 'Repairs', 'Other',
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

function parseExpenseCategory(description: string): string {
  if (description === 'Delivery cost incurred') return 'Delivery';
  const match = description?.match(/Expense recorded \((\w+)\)/);
  return match?.[1] ?? 'Other';
}

// ─── Date Range Bar ───────────────────────────────────────────────────────────

function DateRangeBar({ from, to, onChangeFrom, onChangeTo }: {
  from: string; to: string;
  onChangeFrom: (v: string) => void; onChangeTo: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-2 flex-1 h-11 px-3 border border-[#E2E8F0] rounded-[10px] bg-white">
        <Calendar size={14} className="text-[#64748B] shrink-0" />
        <input
          type="date"
          value={from}
          onChange={(e) => onChangeFrom(e.target.value)}
          className="flex-1 text-xs text-[#0A0D14] bg-transparent outline-none"
        />
      </div>
      <span className="text-[#94A3B8] text-sm">–</span>
      <div className="flex items-center gap-2 flex-1 h-11 px-3 border border-[#E2E8F0] rounded-[10px] bg-white">
        <Calendar size={14} className="text-[#64748B] shrink-0" />
        <input
          type="date"
          value={to}
          onChange={(e) => onChangeTo(e.target.value)}
          className="flex-1 text-xs text-[#0A0D14] bg-transparent outline-none"
        />
      </div>
    </div>
  );
}

// ─── Slide Over ───────────────────────────────────────────────────────────────

function SlideOver({ open, onClose, children, width = 'max-w-lg' }: {
  open: boolean; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-black/30 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        onClick={onClose}
      />
      <div className={cn('fixed inset-y-0 right-0 z-50 w-full flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out', width, open ? 'translate-x-0' : 'translate-x-full')}>
        {children}
      </div>
    </>
  );
}

// ─── Main Finance Page ────────────────────────────────────────────────────────

export default function FinancePage() {
  const [mainTab, setMainTab] = useState<MainTab>('Overview');
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(todayIso());

  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [openDebts, setOpenDebts] = useState<any[]>([]);
  const [storeId, setStoreId] = useState('');

  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Rent');
  const [expenseCategorySheetOpen, setExpenseCategorySheetOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [expenseReceiptRef, setExpenseReceiptRef] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('All');

  useEffect(() => {
    locationsApi.list().then((res: any) => {
      const list = res.data ?? res ?? [];
      const store = (Array.isArray(list) ? list : []).find((l: any) => l.kind === 'Store') || list[0];
      if (store) setStoreId(store.id);
    }).catch(() => {});
  }, []);

  const fetchOverview = () => {
    setOverviewLoading(true);
    financeApi.getOverview(from, to)
      .then((res: any) => setOverview(res.data ?? res))
      .catch(() => {})
      .finally(() => setOverviewLoading(false));
  };

  const fetchLedger = () => {
    setLedgerLoading(true);
    financeApi.getLedger({ from, to })
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setLedgerEntries(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setLedgerEntries([]))
      .finally(() => setLedgerLoading(false));
  };

  useEffect(() => {
    financeApi.getOpenDebts()
      .then((res: any) => {
        const raw = res.data?.items ?? res.data ?? res ?? [];
        setOpenDebts(Array.isArray(raw) ? raw : []);
      }).catch(() => setOpenDebts([]));
  }, []);

  useEffect(() => { fetchOverview(); fetchLedger(); }, [from, to]);

  const expenseEntries = useMemo(() =>
    ledgerEntries
      .filter((e) => e.referenceType === 'Expense' || e.eventDescription?.includes('Expense'))
      .map((e) => ({ ...e, category: parseExpenseCategory(e.eventDescription) })),
    [ledgerEntries]
  );

  const filteredExpenses = useMemo(() =>
    expenseEntries.filter((e) => expenseFilter === 'All' || e.category === expenseFilter),
    [expenseEntries, expenseFilter]
  );

  const totalExpensesInPeriod = useMemo(() =>
    expenseEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenseEntries]
  );

  const totalLedgerBalance = useMemo(() =>
    ledgerEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    [ledgerEntries]
  );

  const accountCount = useMemo(() =>
    new Set(ledgerEntries.flatMap((e) => [e.debitAccount, e.creditAccount])).size,
    [ledgerEntries]
  );

  const filteredLedger = useMemo(() => {
    if (!ledgerSearch.trim()) return ledgerEntries;
    const q = ledgerSearch.toLowerCase();
    return ledgerEntries.filter((e) =>
      e.eventDescription?.toLowerCase().includes(q) ||
      e.debitAccount?.toLowerCase().includes(q) ||
      e.creditAccount?.toLowerCase().includes(q)
    );
  }, [ledgerEntries, ledgerSearch]);

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

  const handleCreateExpense = async () => {
    if (!expenseAmount || !storeId) { toast.error('Please enter a valid amount'); return; }
    setSubmittingExpense(true);
    try {
      await financeApi.createExpense(
        { category: expenseCategory, amount: Number(expenseAmount), incurredOn: expenseDate, notes: expenseNotes.trim() || undefined },
        storeId
      );
      toast.success('Expense recorded');
      setShowAddExpense(false);
      setExpenseAmount(''); setExpenseNotes(''); setExpenseReceiptRef('');
      fetchLedger(); fetchOverview();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  return (
    <div className="space-y-0 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <h1 className="text-[22px] font-bold text-[#0A0D14]">Finance & Accounting</h1>
        {mainTab === 'Expenses' && (
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="w-9 h-9 rounded-full bg-[#0055FF] flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={18} color="#fff" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t)}
            className={cn('mr-6 py-3 text-sm relative transition-colors cursor-pointer',
              mainTab === t ? 'font-bold text-[#0A0D14]' : 'font-medium text-[#64748B] hover:text-[#0A0D14]'
            )}
          >
            {t}
            {mainTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0055FF] rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {mainTab === 'Overview' && (
        <div className="space-y-6">
          <p className="text-[13px] font-semibold text-[#64748B]">Performance Summary</p>
          <DateRangeBar from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

          {overviewLoading ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Total Revenue', value: fmt(overview?.totalRevenue), icon: TrendingUp, iconColor: BLUE, bg: '#EFF5FF' },
                  { label: 'Total COGS', value: fmt(overview?.totalCogs), icon: ShoppingCart, iconColor: AMBER, bg: '#FEF9C3' },
                  { label: 'Gross Profit', value: fmt(overview?.grossProfit), icon: PieChart, iconColor: GREEN, bg: '#DCFCE7',
                    sub: overview?.totalRevenue > 0 ? `Margin: ${((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1)}%` : undefined },
                  { label: 'Total Expenses', value: fmt(overview?.totalExpenses), icon: FileText, iconColor: RED, bg: '#FEE2E2' },
                  { label: 'Net Profit', value: fmt(overview?.netProfit), icon: DollarSign, iconColor: BLUE, bg: '#EFF5FF',
                    sub: overview?.totalRevenue > 0 ? `Margin: ${((overview.netProfit / overview.totalRevenue) * 100).toFixed(1)}%` : undefined },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
                      <s.icon size={16} style={{ color: s.iconColor }} />
                    </div>
                    <p className="text-xs text-[#64748B]">{s.label}</p>
                    <p className="text-base font-bold text-[#0A0D14] mt-1">{s.value}</p>
                    {s.sub && <p className="text-[11px] font-semibold mt-1" style={{ color: GREEN }}>{s.sub}</p>}
                  </div>
                ))}
              </div>

              <p className="text-[15px] font-bold text-[#0A0D14]">Outstanding Balances</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} color="#EA580C" />
                    <p className="text-xs font-bold text-[#0A0D14]">Receivables</p>
                  </div>
                  <p className="text-base font-bold mt-1" style={{ color: '#EA580C' }}>{fmt(overview?.outstandingReceivables)}</p>
                  <p className="text-xs text-[#64748B] mt-1">{openDebts.length} open debts</p>
                </div>
                <div className="flex-1 bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={14} color={RED} />
                    <p className="text-xs font-bold text-[#0A0D14]">Payables</p>
                  </div>
                  <p className="text-base font-bold mt-1" style={{ color: RED }}>{fmt(overview?.outstandingPayables)}</p>
                  <p className="text-xs text-[#64748B] mt-1">To suppliers</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Ledger Tab ── */}
      {mainTab === 'Ledger' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#EFF5FF] rounded-xl p-4">
            <Info size={16} color={BLUE} className="shrink-0" />
            <p className="text-[13px] font-medium text-[#0055FF] leading-relaxed">
              Every sale, purchase, expense and payroll run posts a balanced entry here automatically.
            </p>
          </div>

          <div className="bg-[#ECFDF5] rounded-2xl p-4 border border-[#A7F3D0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
                <BookOpen size={18} color="#059669" />
              </div>
              <p className="text-base font-bold text-[#0A0D14]">General Ledger</p>
            </div>
            <p className="text-xs text-[#047857] leading-relaxed mb-4">
              {ledgerEntries.length} entries in the selected period, totalling {fmt(totalLedgerBalance)}.
            </p>
            <button
              type="button"
              onClick={() => setLedgerOpen(true)}
              className="w-full h-11 rounded-[10px] bg-white border border-[#A7F3D0] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ECFDF5] transition-colors"
            >
              <span className="text-sm font-semibold text-[#059669]">View General Ledger</span>
              <ChevronRight size={16} color="#059669" />
            </button>
          </div>
        </div>
      )}

      {/* ── Expenses Tab ── */}
      {mainTab === 'Expenses' && (
        <div className="space-y-4">
          <DateRangeBar from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

          {/* Stat cards — horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            <div className="min-w-36 bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9] shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center mb-3">
                <FileText size={16} color={RED} />
              </div>
              <p className="text-base font-bold text-[#0A0D14]">{fmt(totalExpensesInPeriod)}</p>
              <p className="text-xs text-[#64748B] mt-1">Total Expenses</p>
            </div>
            <div className="min-w-36 bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9] shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#EFF5FF] flex items-center justify-center mb-3">
                <Tag size={16} color={BLUE} />
              </div>
              <p className="text-lg font-bold text-[#0A0D14]">{expenseEntries.length}</p>
              <p className="text-xs text-[#64748B] mt-1">No. of Expenses</p>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', ...EXPENSE_CATEGORIES].map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setExpenseFilter(pill)}
                className={cn('px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0',
                  expenseFilter === pill ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200'
                )}
              >
                {pill}
              </button>
            ))}
          </div>

          <p className="text-[15px] font-bold text-[#0A0D14]">Expenses</p>

          {ledgerLoading ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">No expenses in this period</p>
          ) : (
            <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
              {filteredExpenses.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn('flex items-center justify-between p-4', idx < filteredExpenses.length - 1 ? 'border-b border-[#E2E8F0]' : '')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                      <FileText size={16} color={AMBER} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A0D14]">{item.category}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(item.occurredOnUtc).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
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

      {/* ── Balancing Tab ── */}
      {mainTab === 'Balancing' && (
        <div className="space-y-4">
          <DateRangeBar from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

          <div className="flex items-center gap-3 bg-[#ECFDF5] rounded-xl p-4 border border-[#A7F3D0]">
            <CheckCircle size={16} color={GREEN} className="shrink-0" />
            <p className="text-sm font-semibold text-[#16A34A]">Books are balanced. Total Debits match Total Credits.</p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
            <p className="text-[15px] font-bold text-[#0A0D14] mb-4">Trial Balance Summary</p>
            <div className="flex justify-between py-2 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B]">Total Debits</span>
              <span className="text-sm font-bold text-[#0A0D14]">{fmt(totalLedgerBalance)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-[#64748B]">Total Credits</span>
              <span className="text-sm font-bold text-[#0A0D14]">{fmt(totalLedgerBalance)}</span>
            </div>
          </div>

          {ledgerLoading ? (
            <div className="py-8 text-center text-sm text-[#64748B]">Loading...</div>
          ) : ledgerEntries.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-6">No activity in this period</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-bold text-[#0A0D14] mb-3">By debit account</p>
                <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
                  {debitTotals.map(([account, total], i) => (
                    <div key={account} className={cn('flex justify-between p-4', i < debitTotals.length - 1 ? 'border-b border-[#E2E8F0]' : '')}>
                      <span className="text-sm text-[#334155]">{account}</span>
                      <span className="text-sm font-semibold text-[#0A0D14]">{fmt(total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0D14] mb-3">By credit account</p>
                <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
                  {creditTotals.map(([account, total], i) => (
                    <div key={account} className={cn('flex justify-between p-4', i < creditTotals.length - 1 ? 'border-b border-[#E2E8F0]' : '')}>
                      <span className="text-sm text-[#64748B]">{account}</span>
                      <span className="text-sm font-semibold text-[#0A0D14]">{fmt(total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── General Ledger Slide-Over ── */}
      <SlideOver open={ledgerOpen} onClose={() => setLedgerOpen(false)} width="max-w-3xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setLedgerOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
              <ArrowLeft size={18} className="text-[#0A0D14]" />
            </button>
            <h2 className="text-lg font-bold text-[#0A0D14]">General Ledger</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3 bg-[#EFF5FF] rounded-xl p-4">
            <Info size={16} color={BLUE} className="shrink-0" />
            <p className="text-xs font-medium text-[#0055FF] leading-relaxed">
              Each financial event posts a balanced double-entry to keep your books accurate.
            </p>
          </div>

          <DateRangeBar from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

          {/* Ledger stat cards */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              { label: 'Total Posted', value: fmt(totalLedgerBalance), icon: Briefcase, iconColor: GREEN, bg: '#DCFCE7' },
              { label: 'Transactions', value: String(ledgerEntries.length), icon: Repeat, iconColor: BLUE, bg: '#EFF5FF' },
              { label: 'Accounts', value: String(accountCount), icon: Book, iconColor: AMBER, bg: '#FEF9C3' },
            ].map((s) => (
              <div key={s.label} className="min-w-36 bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9] shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
                  <s.icon size={16} style={{ color: s.iconColor }} />
                </div>
                <p className="text-base font-bold text-[#0A0D14]">{s.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search event, debit or credit..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
            />
          </div>

          <p className="text-[15px] font-bold text-[#0A0D14]">Journal Entries</p>

          {ledgerLoading ? (
            <div className="py-8 text-center text-sm text-[#64748B]">Loading...</div>
          ) : filteredLedger.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">No ledger entries in this period</p>
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr] bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5">
                <span className="text-xs font-semibold text-[#64748B]">Event</span>
                <span className="text-xs font-semibold text-[#64748B]">Debit</span>
                <span className="text-xs font-semibold text-[#64748B]">Credit</span>
              </div>
              {filteredLedger.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedEntry(item)}
                  className={cn('w-full grid grid-cols-[2fr_1.5fr_1.5fr] px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer text-left transition-colors',
                    i < filteredLedger.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  )}
                >
                  <div className="pr-3 min-w-0">
                    <p className="text-xs font-semibold text-[#0A0D14] truncate">{item.eventDescription}</p>
                    <p className="text-[10px] text-[#64748B]">{fmt(item.amount)}</p>
                  </div>
                  <p className="text-xs text-[#334155] truncate">{item.debitAccount}</p>
                  <p className="text-xs text-[#64748B] truncate">{item.creditAccount}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </SlideOver>

      {/* ── Entry Detail Slide-Over ── */}
      <SlideOver open={!!selectedEntry} onClose={() => setSelectedEntry(null)} width="max-w-md">
        {selectedEntry && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
              <h2 className="text-base font-bold text-[#0A0D14]">{selectedEntry.eventDescription}</h2>
              <button type="button" onClick={() => setSelectedEntry(null)} className="text-[#94A3B8] hover:text-[#0A0D14] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {[
                { label: 'Amount', value: fmt(selectedEntry.amount) },
                { label: 'Debit account', value: selectedEntry.debitAccount },
                { label: 'Credit account', value: selectedEntry.creditAccount },
                { label: 'Reference type', value: selectedEntry.referenceType || 'Manual' },
                { label: 'Date', value: new Date(selectedEntry.occurredOnUtc).toLocaleString() },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-3 border-b border-[#F1F5F9]">
                  <span className="text-sm text-[#64748B]">{row.label}</span>
                  <span className="text-sm font-semibold text-[#0A0D14]">{row.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </SlideOver>

      {/* ── Add Expense Slide-Over ── */}
      <SlideOver open={showAddExpense} onClose={() => setShowAddExpense(false)} width="max-w-md">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] shrink-0">
          <button type="button" onClick={() => setShowAddExpense(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
            <ArrowLeft size={18} className="text-[#0A0D14]" />
          </button>
          <h2 className="text-lg font-bold text-[#0A0D14]">Add Expense</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Category */}
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Expense Category *</p>
            <button
              type="button"
              onClick={() => setExpenseCategorySheetOpen(true)}
              className="w-full h-12 px-4 border border-[#E2E8F0] rounded-[10px] bg-white flex items-center justify-between cursor-pointer hover:border-[#0055FF] transition-colors"
            >
              <span className="text-sm text-[#0A0D14]">{expenseCategory}</span>
              <ChevronRight size={16} className="text-[#64748B]" />
            </button>
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Amount (₦) *</p>
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-12 px-4 border border-[#E2E8F0] rounded-[10px] bg-white text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
            />
          </div>

          {/* Date */}
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Date *</p>
            <div className="flex items-center gap-2 h-12 px-4 border border-[#E2E8F0] rounded-[10px] bg-white">
              <Calendar size={16} className="text-[#64748B] shrink-0" />
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="flex-1 text-sm text-[#0A0D14] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Receipt Reference */}
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Receipt reference (optional)</p>
            <input
              type="text"
              value={expenseReceiptRef}
              onChange={(e) => setExpenseReceiptRef(e.target.value)}
              placeholder="e.g. receipt or invoice number"
              className="w-full h-12 px-4 border border-[#E2E8F0] rounded-[10px] bg-white text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
            />
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Notes (Optional)</p>
            <textarea
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              placeholder="Add notes..."
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-[10px] bg-white text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF] resize-none"
            />
          </div>
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-[#F1F5F9] shrink-0">
          <button
            type="button"
            onClick={handleCreateExpense}
            disabled={!expenseAmount || !storeId || submittingExpense}
            className="w-full h-13 rounded-[14px] bg-[#0055FF] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors py-4"
          >
            {submittingExpense ? 'Saving…' : 'Save Expense'}
          </button>
        </div>

        {/* Category picker overlay */}
        {expenseCategorySheetOpen && (
          <>
            <div className="absolute inset-0 bg-black/20 z-10" onClick={() => setExpenseCategorySheetOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-20 shadow-xl">
              <div className="px-5 py-4 border-b border-[#F1F5F9]">
                <p className="text-base font-bold text-[#0A0D14]">Select Expense Category</p>
              </div>
              <div className="overflow-y-auto max-h-80">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setExpenseCategory(c); setExpenseCategorySheetOpen(false); }}
                    className={cn('w-full text-left px-5 py-4 border-b border-[#F1F5F9] cursor-pointer hover:bg-[#F8FAFC] transition-colors text-sm',
                      expenseCategory === c ? 'font-bold text-[#0055FF]' : 'text-[#0A0D14]'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </SlideOver>
    </div>
  );
}
