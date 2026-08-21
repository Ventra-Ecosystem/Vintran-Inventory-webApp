'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  required?: boolean;
}

export function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search options...',
  className,
  required = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={containerRef} className={cn('relative w-full space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-[#0A0D14]">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearch('');
          }
        }}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-sm text-[#0A0D14] transition-all cursor-pointer outline-none',
          isOpen ? 'border-[#0055FF] ring-2 ring-[#0055FF]/10' : 'border-[#E2E8F0] hover:border-[#CBD5E1]',
          disabled && 'cursor-not-allowed bg-gray-50 opacity-60'
        )}
      >
        <span className={cn('truncate text-left', !selectedOption && 'text-[#94A3B8]')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('text-[#64748B] transition-transform duration-200 shrink-0 ml-2', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95">
          {(searchable || options.length > 6) && (
            <div className="relative mb-1.5 p-1">
              <Search size={14} className="absolute left-3 top-3 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg bg-[#F8FAFC] py-1.5 pl-8 pr-3 text-xs text-[#0A0D14] placeholder-[#94A3B8] outline-none border border-[#E2E8F0] focus:border-[#0055FF]"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-[#94A3B8]">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#EFF5FF] text-[#0055FF]'
                        : 'text-[#0A0D14] hover:bg-[#F8FAFC] hover:text-[#0055FF]'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-[#0055FF] shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
