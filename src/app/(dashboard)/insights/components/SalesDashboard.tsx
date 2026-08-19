'use client';

import { useState } from 'react';
import { Calendar, Download, ChevronDown, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const BLUE = '#0055FF';
const CYAN = '#00DDFF';

function StatCard({ label, value, subLabel, isPositive }: { label: string; value: string; subLabel?: string; isPositive?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-primary-alpha-10 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full border-2 border-brand" />
        </div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      {subLabel && (
        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {subLabel}
        </span>
      )}
    </div>
  );
}

function RevenueTrend() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900">Revenue Trend</h3>
        <button className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          Last 6 months <ChevronDown size={16} />
        </button>
      </div>
      <div className="h-48 relative border-b border-l border-gray-100">
        {/* Mock Chart using CSS/SVG */}
        <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity="0.2" />
              <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 120 C 50 140, 100 80, 150 60 C 200 40, 250 80, 300 40 C 350 0, 400 40, 400 20"
            fill="none"
            stroke={BLUE}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 0 150 L 0 120 C 50 140, 100 80, 150 60 C 200 40, 250 80, 300 40 C 350 0, 400 40, 400 20 L 400 150 Z"
            fill="url(#grad)"
          />
        </svg>
      </div>
    </div>
  );
}

function SavedReports() {
  const reports = [
    { title: 'Monthly tax reconciliation', date: 'Jul 28, 2026', type: 'Custom' },
    { title: 'Q2 inventory evaluation', date: 'Jul 15, 2026', type: 'Inventory' },
    { title: 'High-value customer retention', date: 'Jul 02, 2026', type: 'Customers' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Saved Reports</h3>
        <button className="text-sm font-medium text-brand">Edit</button>
      </div>
      <div className="space-y-3">
        {reports.map((r, i) => (
          <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
            <div className="w-10 h-10 flex items-center justify-center text-gray-500">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{r.title}</p>
              <p className="text-xs text-gray-500">{r.date}</p>
            </div>
            <span className="text-xs text-gray-500">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const matrix = [
    [null, null, '₦1.0M', '₦1.0M', '₦1.4M', '₦1.2M', '₦1.0M'],
    ['₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M'],
    ['₦1.0M', '₦1.0M', '₦1.0M', '₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M'],
    ['₦3.2M', '₦1.0M', '₦1.0M', '₦1.0M', '₦3.7M', '₦1.0M', '₦1.0M'],
    ['₦2.7M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M', '₦1.0M'],
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900">Revenue Heatmap by Day</h3>
        <button className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          July 2026 <ChevronDown size={16} />
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex justify-between mb-2">
            {days.map((d, i) => (
              <span key={i} className="flex-1 text-center text-xs font-medium text-gray-500">{d}</span>
            ))}
          </div>
          <div className="space-y-2">
            {matrix.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-between gap-2">
                {row.map((cell, cIdx) => {
                  if (!cell) return <div key={cIdx} className="flex-1 aspect-square" />;
                  
                  let bg = 'bg-gray-50';
                  let text = 'text-gray-500';
                  let border = 'border-transparent';
                  
                  if (cell === '₦3.7M' || cell === '₦2.7M' || cell === '₦1.4M') {
                    bg = 'bg-[#EFF6FF]';
                    text = 'text-brand';
                    border = 'border-brand/30';
                  }
                  if (rIdx === 4 && cIdx === 4) {
                    bg = 'bg-brand';
                    text = 'text-white';
                  }

                  return (
                    <div key={cIdx} className={`flex-1 aspect-square rounded-lg flex items-center justify-center border ${bg} ${text} ${border}`}>
                      <span className="text-[10px] font-medium">{cell}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <span className="inline-block bg-[#EFF6FF] text-brand px-3 py-1.5 rounded-full text-xs font-semibold">
          Highest day: Fri 24 (₦3.7M)
        </span>
        <p className="text-xs text-gray-400 mt-2">Darker cells indicate higher sales volume.</p>
      </div>
    </div>
  );
}

function ProductLists() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">Top-Selling Products</h3>
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <span className="text-lg font-bold text-brand w-6">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{p.name}</p>
                <p className="text-xs text-gray-500">{p.sold} sold</p>
              </div>
              <span className="text-sm font-bold text-gray-900">{p.rev}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Under-Selling Products</h3>
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-medium">Low sales</span>
        </div>
        <div className="space-y-3">
          {underProducts.map((p, i) => (
            <div key={i} className="flex items-center gap-4 border border-gray-100 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{p.name}</p>
                <p className="text-xs text-gray-500">{p.stock} days in stock</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-900">{p.sold} sold</p>
                <p className="text-[10px] text-red-500 mt-1">Low sales</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SalesDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-lg font-bold text-gray-900">Report Period</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Jul 1 - Jul 31, 2026</span>
            <Calendar size={16} className="text-gray-500" />
          </div>
          <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <Download size={18} className="text-brand" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <StatCard label="Total Revenue" value="₦8,245,600" subLabel="+12% vs June" isPositive={true} />
        <StatCard label="Total Orders" value="2,871" subLabel="+4.2%" isPositive={true} />
        <StatCard label="Products Sold" value="11,169" subLabel="+4.2%" isPositive={true} />
        <StatCard label="Returns" value="121" subLabel="1.7% Rate" isPositive={false} />
      </div>

      <RevenueTrend />
      <ProductLists />
      <Heatmap />
      <SavedReports />

      <button className="w-full mt-6 bg-brand hover:bg-brand/90 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
        Export All Financials
        <Download size={18} />
      </button>
    </div>
  );
}
