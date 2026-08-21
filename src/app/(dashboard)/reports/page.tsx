'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import {
  TrendingUp,
  Package,
  Users,
  Building,
  UserCheck,
  RotateCcw,
  Truck,
  BarChart3,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

const TABS = [
  'Overview',
  'Sales',
  'Inventory',
  'Suppliers',
  'Customers',
  'Staff & Payroll',
  'Returns',
  'Deliveries',
] as const;

type Tab = (typeof TABS)[number];

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('Sales');

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0D14]">Reports & Analytics</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Real-time business performance, inventory insights, and financial reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#0A0D14] hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar size={16} className="text-[#64748B]" />
            <span>Last 30 Days</span>
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-brand text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#F1F5F9] overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-0">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                tab === t ? 'text-[#0055FF]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {tab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'Overview' && (
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-12 text-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF5FF] flex items-center justify-center mx-auto mb-4 text-[#0055FF]">
            <Sparkles size={28} />
          </div>
          <h2 className="text-lg font-bold text-[#0A0D14]">Overview Dashboard</h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto mt-1">
            Summary metrics are calculated automatically from all individual report modules. Select any tab above to view granular analytics.
          </p>
        </div>
      )}

      {/* ── Sales Tab ── */}
      {tab === 'Sales' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: '₦42,850,000', change: '+14.2%', positive: true },
              { label: 'Total Orders', value: '1,420', change: '+8.5%', positive: true },
              { label: 'Avg Order Value', value: '₦30,176', change: '-2.1%', positive: false },
              { label: 'Gross Margin', value: '38.4%', change: '+1.5%', positive: true },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
                <p className="text-xl font-bold text-[#0A0D14] mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5',
                      stat.positive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'
                    )}
                  >
                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart Visual Block */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[#0A0D14]">Revenue Trend</h3>
                <p className="text-xs text-[#64748B]">Monthly sales revenue progression</p>
              </div>
              <span className="text-xs font-semibold text-[#0055FF] bg-[#EFF5FF] px-3 py-1 rounded-full">
                6-Month Trend
              </span>
            </div>

            {/* SVG Visual Chart */}
            <div className="h-64 w-full">
              <svg className="w-full h-full" viewBox="0 0 800 200" fill="none">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0055FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0055FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="800" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                {/* Gradient Fill */}
                <path
                  d="M0 140 Q 150 110, 300 60 T 600 80 T 800 30 L 800 180 L 0 180 Z"
                  fill="url(#revenueGrad)"
                />
                {/* Curve Line */}
                <path
                  d="M0 140 Q 150 110, 300 60 T 600 80 T 800 30"
                  stroke="#0055FF"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Points */}
                <circle cx="300" cy="60" r="5" fill="#0055FF" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="800" cy="30" r="5" fill="#0055FF" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Inventory Tab ── */}
      {tab === 'Inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Total Stock Valuation</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">₦128,450,000</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Low Stock Alerts</p>
              <p className="text-xl font-bold text-[#EF4444] mt-2">12 Items</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Stock Turnover Rate</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">4.8x / year</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Suppliers Tab ── */}
      {tab === 'Suppliers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Active Suppliers</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">24</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Fulfillment Rate</p>
              <p className="text-xl font-bold text-[#16A34A] mt-2">96.2%</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Avg Lead Time</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">3.2 Days</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Customers Tab ── */}
      {tab === 'Customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Total Active Customers</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">840</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Repeat Customer Rate</p>
              <p className="text-xl font-bold text-[#0055FF] mt-2">64.5%</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Outstanding Debt</p>
              <p className="text-xl font-bold text-[#EA580C] mt-2">₦3,420,000</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Staff & Payroll Tab ── */}
      {tab === 'Staff & Payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Active Staff</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">18</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Sales / Staff Member</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">₦2,380,000</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Commission Payouts</p>
              <p className="text-xl font-bold text-[#16A34A] mt-2">₦640,000</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Returns Tab ── */}
      {tab === 'Returns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Total Returns (30d)</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">14 Items</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Return Rate</p>
              <p className="text-xl font-bold text-[#16A34A] mt-2">0.98%</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Refund Value</p>
              <p className="text-xl font-bold text-[#EF4444] mt-2">₦420,000</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Deliveries Tab ── */}
      {tab === 'Deliveries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Completed Deliveries</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">312</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">On-Time Delivery Rate</p>
              <p className="text-xl font-bold text-[#16A34A] mt-2">94.8%</p>
            </div>
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B]">Avg Delivery Duration</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-2">2.4 Hours</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
