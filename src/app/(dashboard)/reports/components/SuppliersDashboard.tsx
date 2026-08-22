'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar, Download, ChevronDown } from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  badgeColor = 'gray',
}: {
  label: string;
  value: string;
  subLabel?: string;
  badgeColor?: 'green' | 'orange' | 'red' | 'gray';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'red'
              ? 'bg-[#FEE2E2] text-[#EF4444]'
              : badgeColor === 'green'
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

export function SuppliersDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const payables = [
    { name: 'Dangote Foods PLC', due: 'Due 10 Aug', amt: '₦1,200,000', stat: 'Due Soon', color: 'orange' },
    { name: 'Flour Mills of Nigeria', due: 'Overdue 12 Jul', amt: '₦450,000', stat: 'Overdue', color: 'red' },
    { name: 'Chi Limited', due: 'Due 28 Aug', amt: '₦150,000', stat: 'Current', color: 'green' },
  ];

  const periodComp = [
    { label: 'Total Purchases', amt: '₦7.2M', prev: '₦6.8M', change: '+5.9%', pos: true },
    { label: 'Outstanding Payables', amt: '₦1.8M', prev: '₦2.1M', change: '-14.3%', pos: true },
    { label: 'Avg Lead Time', amt: '4.2 days', prev: '', change: '-12.5%', pos: true },
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
        <StatCard label="Total Purchases" value="₦7.2M" />
        <StatCard label="Outstanding Payables" value="₦1.8M" subLabel="Due" badgeColor="orange" />
        <StatCard label="Active Suppliers" value="11" />
        <StatCard label="Avg Lead Time" value="4.2 days" subLabel="Efficient" badgeColor="green" />
      </div>

      {/* On-Time Fulfilment Circular Gauge */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0A0D14] mb-1">On-Time Fulfilment</h3>
          <p className="text-2xl font-bold text-[#0055FF] mb-1">87% Rate</p>
          <p className="text-xs text-[#64748B]">Target threshold: 90% SLA</p>
        </div>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EFF6FF" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#0055FF"
              strokeWidth="12"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 * 0.13}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-bold text-[#0055FF]">87%</span>
        </div>
      </div>

      {/* Purchase Trend Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Purchase Trend</h3>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>Last 6 months</span>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="h-32 flex items-end justify-around pt-4">
          {[
            { month: 'Jan', pct: 20 },
            { month: 'Feb', pct: 30 },
            { month: 'Mar', pct: 45 },
            { month: 'Apr', pct: 25 },
            { month: 'May', pct: 55 },
            { month: 'Jun', pct: 65 },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-3 bg-[#0055FF] rounded-full transition-all duration-300"
                style={{ height: `${m.pct}%` }}
              />
              <span className="text-[11px] text-[#94A3B8]">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Outstanding Payables List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14] px-1">Outstanding Payables</h3>
        <div className="space-y-2.5">
          {payables.map((l, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0A0D14] text-xs">{l.name}</span>
                <span className="font-bold text-[#0A0D14] text-xs">{l.amt}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748B]">{l.due}</span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
                    l.color === 'red'
                      ? 'bg-[#FEE2E2] text-[#EF4444]'
                      : l.color === 'orange'
                      ? 'bg-[#FFEDD5] text-[#C2410C]'
                      : 'bg-[#DCFCE7] text-[#16A34A]'
                  )}
                >
                  {l.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Period Comparison */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-[#0A0D14]">Period Comparison</h3>
          <span className="text-xs text-[#94A3B8]">This Month vs Last Month</span>
        </div>
        <div className="space-y-2.5">
          {periodComp.map((c, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 space-y-1">
              <div className="flex justify-between items-center font-bold text-[#0A0D14] text-xs">
                <span>{c.label}</span>
                <span>
                  {c.amt} {c.prev && <span className="font-normal text-[#64748B]">vs {c.prev}</span>}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#94A3B8]">Jul vs Jun</span>
                <span className={cn('font-semibold', c.pos ? 'text-[#16A34A]' : 'text-[#EF4444]')}>
                  {c.pos ? '↗' : '↘'} {c.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Summary Box */}
      <div className="bg-[#F0FDF4] border border-[#10B981] rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Benefits Summary</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#64748B]">Total benefits Received</p>
            <p className="text-base font-bold text-[#0A0D14]">₦450,000</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#64748B]">Benefits applied</p>
            <p className="text-base font-bold text-[#0A0D14]">₦380,000</p>
          </div>
        </div>
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B]">Utilisation rate</span>
            <span className="font-bold text-[#10B981]">89.4%</span>
          </div>
          <div className="h-1.5 bg-[#D1FAE5] rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full w-[89.4%]" />
          </div>
          <div className="flex justify-between text-[10px] text-[#94A3B8]">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
