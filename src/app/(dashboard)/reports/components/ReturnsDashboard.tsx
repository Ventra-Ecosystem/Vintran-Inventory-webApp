'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar, Download } from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  badgeColor = 'red',
}: {
  label: string;
  value: string;
  subLabel?: string;
  badgeColor?: 'red' | 'green';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'green' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'
          )}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}

export function ReturnsDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const returnReasons = [
    { label: 'Defective/Damaged (60)', pct: 42, color: '#0055FF' },
    { label: 'Wrong Item Sent (40)', pct: 28, color: '#00DDFF' },
    { label: 'Changed Mind (26)', pct: 18, color: '#F59E0B' },
    { label: 'Other (17)', pct: 12, color: '#94A3B8' },
  ];

  const topReturned = [
    { name: 'Premium Wireless Earbuds', times: '18 times', reason: 'Defective', category: 'Electronics', val: '₦324,000' },
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
        <StatCard label="Total returns" value="13 units" subLabel="+11.7% MoM" badgeColor="red" />
        <StatCard label="Return rate" value="1.7%" subLabel="+0.2% vs Jun" badgeColor="red" />
        <StatCard label="Return Value" value="₦92,000" subLabel="+14.4%" badgeColor="red" />
        <StatCard label="Avg Resolution" value="2.3 days" subLabel="-17.9% Time" badgeColor="green" />
      </div>

      {/* Return Reasons Breakdown Progress Bars */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14] px-1">Return Reasons Breakdown</h3>
        <div className="space-y-3 bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm">
          {returnReasons.map((r, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#64748B]">{r.label}</span>
                <span className="font-bold text-[#0A0D14]">{r.pct}%</span>
              </div>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Returns by Product Category Donut */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Returns by Product Category</h3>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="15" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="15"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * 0.82}
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#00DDFF"
                strokeWidth="15"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * 0.57}
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0055FF"
                strokeWidth="15"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * 0.45}
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="32.5" fill="#FFFFFF" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#64748B]">Total Value</span>
              <span className="text-sm font-bold text-[#0A0D14]">₦892K</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
              <span>Electronics (45%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#00DDFF]" />
              <span>Fashion (25%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Home & Living (18%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
              <span>Food (12%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Returned Products List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14] px-1">Top Returned Products</h3>
        <div className="space-y-2.5">
          {topReturned.map((p, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[#0055FF] w-6">{i + 1}</span>
              <div className="flex-1">
                <p className="font-bold text-[#0A0D14] text-xs">{p.name}</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  {p.times} • {p.reason} • {p.category}
                </p>
              </div>
              <span className="font-bold text-[#0A0D14] text-xs">{p.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
