'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar, Download } from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  badgeColor = 'gray',
}: {
  label: string;
  value: string;
  subLabel?: string;
  badgeColor?: 'orange' | 'green' | 'gray';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'green'
              ? 'bg-[#DCFCE7] text-[#16A34A]'
              : badgeColor === 'orange'
              ? 'bg-[#FFEDD5] text-[#C2410C]'
              : 'bg-[#F1F5F9] text-[#64748B]'
          )}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}

export function DeliveriesDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const methodBreakdown = [
    { method: 'Own Dispatch', rev: '₦820K', cost: '₦180K', margin: '78%', mColor: 'text-[#16A34A]' },
    { method: 'Third-Party', rev: '₦460K', cost: '₦305K', margin: '34%', mColor: 'text-[#D97706]' },
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

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Delivery Revenue" value="₦1.2M" />
        <StatCard label="Delivery Costs" value="₦419,000" subLabel="Due" badgeColor="orange" />
      </div>

      {/* Net Delivery Contribution Highlight Card */}
      <div className="bg-[#F0F9FF] border border-[#0055FF] rounded-2xl p-5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[#0A0D14]">Net Delivery Contribution</span>
          <span className="bg-[#DCFCE7] text-[#16A34A] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
            +8.2% vs Jun
          </span>
        </div>
        <p className="text-2xl font-bold text-[#0A0D14]">₦795,000</p>
      </div>

      {/* Revenue vs Cost Trend */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14]">Revenue vs Cost Trend</h3>
        <div className="h-40 w-full pt-2">
          <svg className="w-full h-full" viewBox="0 0 300 120">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="20" y1={i * 25 + 10} x2="300" y2={i * 25 + 10} stroke="#F1F5F9" strokeWidth="1" />
            ))}
            {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((l, i) => (
              <text key={i} x={30 + i * 50} y="110" fontSize="9" fill="#94A3B8" textAnchor="middle">
                {l}
              </text>
            ))}
            {/* Revenue Line */}
            <polyline points="20,60 70,50 120,60 170,20 220,40 270,10" fill="none" stroke="#0055FF" strokeWidth="2" />
            {/* Cost Line */}
            <polyline points="20,70 70,65 120,55 170,65 220,55 270,60" fill="none" stroke="#F59E0B" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Breakdown by Method Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14]">Breakdown by Method</h3>
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
          <div className="bg-[#F8FAFC] px-4 py-2.5 flex text-[#64748B] font-medium text-[11px]">
            <span className="flex-2">Method</span>
            <span className="flex-1 text-right">Revenue</span>
            <span className="flex-1 text-right">Cost</span>
            <span className="flex-1 text-right">Margin</span>
          </div>
          {methodBreakdown.map((row, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center text-xs">
              <span className="flex-2 text-[#0A0D14] font-medium">{row.method}</span>
              <span className="flex-1 text-right font-bold text-[#0A0D14]">{row.rev}</span>
              <span className="flex-1 text-right text-[#64748B]">{row.cost}</span>
              <span className={cn('flex-1 text-right font-bold', row.mColor)}>{row.margin}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14]">Monthly Comparison (Jul vs Jun)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#64748B]">Revenue</span>
            <span className="font-bold text-[#0A0D14]">₦1.28M vs ₦1.15M (+11.3%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#64748B]">Costs</span>
            <span className="font-bold text-[#16A34A]">₦485K vs ₦510K (-4.9%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#64748B]">Net Contribution</span>
            <span className="font-bold text-[#16A34A]">₦795K vs ₦640K (+24.2%)</span>
          </div>
        </div>
      </div>

      {/* Delivery Method Split Donut */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Delivery Method Split</h3>
        <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center justify-around gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeLinecap="round" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0055FF"
                strokeWidth="15"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * 0.38}
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="32.5" fill="#FFFFFF" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-[#0A0D14]">247</span>
              <span className="text-[10px] text-[#64748B]">total</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A0D14]">
              <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
              <span>Own Dispatch (62%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A0D14]">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Third-Party (38%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
