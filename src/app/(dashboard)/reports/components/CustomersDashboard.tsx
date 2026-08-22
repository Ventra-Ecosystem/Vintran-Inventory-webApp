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
  badgeColor?: 'green' | 'gray';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'green' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]'
          )}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}

export function CustomersDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const topCustomers = [
    { name: 'Alhaji Musa & Sons', orders: '24 orders', spent: '₦1,850,000' },
    { name: 'Chioma Okoye Boutique', orders: '18 orders', spent: '₦1,240,000' },
    { name: 'Gbagada Retail Hub', orders: '15 orders', spent: '₦980,000' },
    { name: 'Ikeja Supermart', orders: '15 orders', spent: '₦910,000' },
    { name: 'Lekki Stores', orders: '15 orders', spent: '₦765,000' },
    { name: 'Victoria Island Mart', orders: '15 orders', spent: '₦729,000' },
    { name: 'Yaba Trade Center', orders: '15 orders', spent: '₦630,000' },
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
        <StatCard label="Total Customers" value="120" />
        <StatCard label="Active This Month" value="79" />
        <StatCard label="Retention Rate" value="86%" subLabel="+2.4% MoM" badgeColor="green" />
        <StatCard label="Avg Lifetime Value" value="₦54,000" />
      </div>

      {/* Customer Cohorts Segment Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Customer Cohorts</h3>
        <div className="h-4 bg-[#F1F5F9] rounded-xl flex overflow-hidden">
          <div className="w-[55%] bg-[#0055FF]" />
          <div className="w-[2px] bg-white" />
          <div className="w-[30%] bg-[#00DDFF]" />
          <div className="w-[2px] bg-white" />
          <div className="w-[15%] bg-[#D946EF]" />
        </div>
        <div className="flex justify-between text-xs text-[#64748B] pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
            <span>Returning (55%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00DDFF]" />
            <span>VIP (30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#D946EF]" />
            <span>New (15%)</span>
          </div>
        </div>
      </div>

      {/* Repeat Purchase Trend Line */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#0A0D14]">Repeat Purchase Trend</h3>
          <p className="text-xs text-[#94A3B8]">Monthly repeat rate over 6 months</p>
        </div>
        <div className="h-36 w-full pt-2">
          <svg className="w-full h-full" viewBox="0 0 300 120">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="30" y1={i * 25 + 10} x2="300" y2={i * 25 + 10} stroke="#F1F5F9" strokeWidth="1" />
            ))}
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((l, i) => (
              <text key={i} x={45 + i * 50} y="110" fontSize="9" fill="#94A3B8" textAnchor="middle">
                {l}
              </text>
            ))}
            <polyline
              points="30,80 80,70 130,80 180,50 230,30 280,45 300,50"
              fill="none"
              stroke="#0055FF"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Top Customers by Spent */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14] px-1">Top Customers by Spent</h3>
        <div className="space-y-2.5">
          {topCustomers.map((c, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CBD5E1] shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-[#0A0D14] text-xs">{c.name}</p>
                <p className="text-[11px] text-[#64748B]">{c.orders}</p>
              </div>
              <span className="font-bold text-[#0055FF] text-xs">{c.spent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
