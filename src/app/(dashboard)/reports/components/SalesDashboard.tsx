'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import {
  Calendar,
  Download,
  ChevronDown,
  FileText,
  TrendingUp,
  TrendingDown,
  Circle,
} from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  isPositive,
}: {
  label: string;
  value: string;
  subLabel?: string;
  isPositive?: boolean;
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#EFF5FF] flex items-center justify-center text-[#0055FF]">
          <Circle size={10} fill="#0055FF" />
        </div>
        <span className="text-xs font-medium text-[#64748B]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold',
            isPositive === false
              ? 'bg-[#FEE2E2] text-[#EF4444]'
              : 'bg-[#DCFCE7] text-[#16A34A]'
          )}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}

export function SalesDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');
  const [trendRange, setTrendRange] = useState('Last 6 months');
  const [heatmapMonth, setHeatmapMonth] = useState('July 2026');

  const topProducts = [
    { name: 'Premium Basmati Rice 5kg', sold: '1,240', rev: '₦3.1M' },
    { name: 'Vegetable Oil 3L', sold: '982', rev: '₦2.4M' },
    { name: 'Spaghetti 500g Pack', sold: '840', rev: '₦1.8M' },
  ];

  const underProducts = [
    { name: 'Smart Speaker Mini', stock: '42', sold: '0' },
    { name: 'Ceramic Mug Set', stock: '28', sold: '2' },
    { name: 'Travel Adapter Kit', stock: '18', sold: '1' },
  ];

  const monthComparisons = [
    { label: 'Revenue', thisM: '₦18.4M', lastM: '₦16.2M', change: '+13.6%', positive: true },
    { label: 'Orders', thisM: '2,847', lastM: '2,510', change: '+13.4%', positive: true },
    { label: 'Avg Order Value', thisM: '₦6,480', lastM: '₦6,450', change: '+0.5%', positive: true },
    { label: 'Returns', thisM: '143', lastM: '128', change: '+11.7%', positive: false },
  ];

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapMatrix = [
    [null, null, '₦1.0M', '₦1.0M', '₦1.4M', '₦1.2M', '₦1.0M'],
    ['₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M'],
    ['₦1.0M', '₦1.0M', '₦1.0M', '₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M'],
    ['₦3.2M', '₦1.0M', '₦1.0M', '₦1.0M', '₦3.7M', '₦1.0M', '₦1.0M'],
    ['₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M'],
  ];

  const profitCategories = [
    { category: 'Electronics', rev: '₦7.2M', cogs: '₦4.8M', margin: '+32%' },
    { category: 'Fashion', rev: '₦5.1M', cogs: '₦2.8M', margin: '+45%' },
    { category: 'Food & Beverage', rev: '₦3.8M', cogs: '₦3.1M', margin: '+18%' },
    { category: 'Home & Living', rev: '₦2.3M', cogs: '₦1.4M', margin: '+38%' },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Period Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F1F5F9] shadow-sm">
        <h2 className="text-sm font-bold text-[#0A0D14]">Report Period</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0] text-[#334155] text-xs font-medium">
            <span>{period}</span>
            <Calendar size={14} className="text-[#64748B]" />
          </div>
          <button
            type="button"
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#0055FF] hover:bg-[#EFF5FF] transition-colors cursor-pointer"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value="₦8,245,600" subLabel="+12% vs June" isPositive={true} />
        <StatCard label="Total Orders" value="2,871" subLabel="+4.2%" isPositive={true} />
        <StatCard label="Products Sold" value="11,169" subLabel="+4.2%" isPositive={true} />
        <StatCard label="Returns" value="121" subLabel="1.7% Rate" isPositive={false} />
      </div>

      {/* Revenue by Category Progress Bars */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Revenue by Category</h3>
        <div className="space-y-3">
          {[
            { name: 'Electronics', value: '₦7.2M', pct: 60 },
            { name: 'Fashion', value: '₦5.1M', pct: 40 },
            { name: 'Food & Drinks', value: '₦3.8M', pct: 30 },
            { name: 'Home Goods', value: '₦2.3M', pct: 20 },
          ].map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#64748B]">{cat.name}</span>
                <span className="font-bold text-[#0A0D14]">{cat.value}</span>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0055FF] rounded-full transition-all duration-300"
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Channel Donut Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Revenue by Channel</h3>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="20" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#00DDFF"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="0"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0055FF"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="87.9"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="30" fill="#FFFFFF" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#64748B]">Total</span>
              <span className="text-sm font-bold text-[#0A0D14]">₦18.4M</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
                <span>In-Store</span>
              </div>
              <p className="text-sm font-bold text-[#0A0D14] pl-4">₦11.9M • 65%</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <div className="w-2 h-2 rounded-full bg-[#00DDFF]" />
                <span>Marketplace</span>
              </div>
              <p className="text-sm font-bold text-[#0A0D14] pl-4">₦6.5M • 35%</p>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store vs Marketplace Split Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14]">In-Store vs Marketplace Split</h3>
        <div className="h-6 bg-[#F1F5F9] rounded-xl flex overflow-hidden">
          <div className="w-[65%] bg-[#0055FF]" />
          <div className="w-[35%] bg-[#00DDFF]" />
        </div>
        <div className="flex justify-between text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
            <span>In-Store (65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00DDFF]" />
            <span>Marketplace (35%)</span>
          </div>
        </div>
      </div>

      {/* Top-Selling & Under-Selling Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Selling */}
        <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
          <h3 className="text-base font-bold text-[#0A0D14]">Top-Selling Products</h3>
          <div className="space-y-2.5">
            {topProducts.map((p, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-xl p-3 flex items-center gap-3">
                <span className="text-sm font-bold text-[#0055FF] w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#0A0D14]">{p.name}</p>
                  <p className="text-[11px] text-[#94A3B8]">{p.sold} sold</p>
                </div>
                <span className="font-bold text-[#0A0D14]">{p.rev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Under Selling */}
        <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#0A0D14]">Under-Selling Products</h3>
            <span className="bg-[#FFEDD5] text-[#C2410C] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Low sales
            </span>
          </div>
          <div className="space-y-2.5">
            {underProducts.map((p, i) => (
              <div key={i} className="border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E293B]" />
                  <div>
                    <p className="font-semibold text-[#0A0D14]">{p.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{p.stock} days in stock</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A0D14]">{p.sold} sold</p>
                  <span className="text-[10px] text-[#EF4444]">Low sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month Comparison */}
      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">This Month vs Last Month</h3>
        <div className="space-y-3">
          {monthComparisons.map((c, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <div>
                <p className="text-[11px] text-[#64748B]">{c.label}</p>
                <p className="font-bold text-[#0A0D14]">
                  {c.thisM} <span className="font-normal text-[#64748B]">vs {c.lastM}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                {c.positive ? (
                  <TrendingUp size={16} className="text-[#16A34A]" />
                ) : (
                  <TrendingDown size={16} className="text-[#EF4444]" />
                )}
                <span className={cn('font-semibold text-xs', c.positive ? 'text-[#16A34A]' : 'text-[#EF4444]')}>
                  {c.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Trend Line Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Revenue Trend</h3>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>{trendRange}</span>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="h-52 w-full pt-4">
          <svg className="w-full h-full" viewBox="0 0 300 150">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0055FF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0055FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="40" y1={i * 25 + 10} x2="300" y2={i * 25 + 10} stroke="#F1F5F9" strokeWidth="1" />
            ))}
            {['250m', '200m', '150m', '100m', '50m', '0'].map((l, i) => (
              <text key={i} x="35" y={i * 25 + 14} fontSize="9" fill="#94A3B8" textAnchor="end">
                {l}
              </text>
            ))}
            {['10 JUL', '11 JUL', '12 JUL', '13 JUL', '14 JUL'].map((l, i) => (
              <text key={i} x={60 + i * 50} y="145" fontSize="8" fill="#94A3B8" textAnchor="middle">
                {l}
              </text>
            ))}
            <path
              d="M 40 100 C 60 110, 80 80, 100 80 C 130 80, 150 40, 170 40 C 190 40, 200 20, 220 50 C 240 80, 260 60, 280 80 C 290 90, 300 80, 300 80"
              fill="none"
              stroke="#0055FF"
              strokeWidth="2"
            />
            <path
              d="M 40 135 L 40 100 C 60 110, 80 80, 100 80 C 130 80, 150 40, 170 40 C 190 40, 200 20, 220 50 C 240 80, 260 60, 280 80 C 290 90, 300 80, 300 80 L 300 135 Z"
              fill="url(#grad)"
            />
            <circle cx="170" cy="40" r="4" fill="#FFFFFF" stroke="#0055FF" strokeWidth="2" />
            <text x="170" y="25" fontSize="11" fill="#0055FF" fontWeight="bold" textAnchor="middle">
              ₦146m
            </text>
          </svg>
        </div>
      </div>

      {/* Saved Reports */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Saved Reports</h3>
          <button type="button" className="text-[#0055FF] font-semibold hover:underline">
            Edit
          </button>
        </div>
        <div className="space-y-2">
          {[
            { title: 'Monthly tax reconciliation', date: 'Jul 28, 2026', type: 'Custom' },
            { title: 'Q2 inventory evaluation', date: 'Jul 15, 2026', type: 'Inventory' },
            { title: 'High-value customer retention', date: 'Jul 02, 2026', type: 'Customers' },
          ].map((report, idx) => (
            <div key={idx} className="bg-[#F8FAFC] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-[#64748B]" />
                <div>
                  <p className="font-semibold text-[#0A0D14]">{report.title}</p>
                  <p className="text-[11px] text-[#94A3B8]">{report.date}</p>
                </div>
              </div>
              <span className="text-[11px] text-[#64748B] font-medium">{report.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export All Financials Button */}
      <button
        type="button"
        className="w-full h-12 rounded-xl bg-[#0055FF] text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
      >
        <span>Export All Financials</span>
        <Download size={16} />
      </button>

      {/* Revenue Heatmap by Day */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Revenue Heatmap by Day</h3>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>{heatmapMonth}</span>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 text-center font-medium text-[#94A3B8] text-[11px]">
            {heatmapDays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="space-y-2">
            {heatmapMatrix.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-7 gap-2 text-center text-[10px]">
                {row.map((cell, cIdx) => {
                  if (!cell) return <div key={cIdx} className="aspect-square" />;
                  let bg = 'bg-[#F1F5F9] text-[#64748B]';
                  if (cell === '₦3.7M' || cell === '₦2.7M' || cell === '₦1.4M') {
                    bg = 'bg-[#EFF6FF] text-[#0055FF] border border-[#0055FF] font-semibold';
                  }
                  if (rIdx === 3 && cIdx === 4) {
                    bg = 'bg-[#0055FF] text-white font-bold';
                  }
                  return (
                    <div key={cIdx} className={cn('aspect-square rounded-xl flex items-center justify-center p-1', bg)}>
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <span className="bg-[#EFF6FF] text-[#0055FF] font-semibold text-xs px-3 py-1 rounded-full">
            Highest day: Fri 24 (₦3.7M)
          </span>
          <p className="text-[11px] text-[#94A3B8] mt-2">Darker cells indicate higher sales volume.</p>
        </div>
      </div>

      {/* Profit Margin by Category Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14]">Profit Margin by Category</h3>
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
          <div className="bg-[#F8FAFC] px-4 py-2.5 flex text-[#64748B] font-medium text-[11px]">
            <span className="flex-2">Category</span>
            <span className="flex-1 text-right">Revenue</span>
            <span className="flex-1 text-right">COGS</span>
            <span className="flex-1 text-right">Margin</span>
          </div>
          {profitCategories.map((row, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center text-xs">
              <span className="flex-2 text-[#64748B]">{row.category}</span>
              <span className="flex-1 text-right font-bold text-[#0A0D14]">{row.rev}</span>
              <span className="flex-1 text-right text-[#64748B]">{row.cogs}</span>
              <span className="flex-1 text-right font-semibold text-[#16A34A]">{row.margin}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
