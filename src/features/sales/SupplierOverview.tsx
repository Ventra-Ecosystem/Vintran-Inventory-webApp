import type { Supplier } from './types';

export function SupplierOverview({ supplier }: { supplier: Supplier }) {
  return (
    <div className="rounded-xl border border-neutral-100 p-4 space-y-3">
      {[
        ['Business name', supplier.name],
        ['Contact person', supplier.contact],
        ['Phone', supplier.phone],
        ['Email', supplier.email],
        ['Address', supplier.address],
        ['Category', supplier.category],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between text-sm border-b border-neutral-50 pb-2 last:border-0"
        >
          <span className="text-text-subtle">{label}</span>
          <span className="font-medium text-neutral-900 text-right max-w-[55%]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
