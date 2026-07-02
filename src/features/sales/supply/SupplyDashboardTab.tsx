import { PakageIcon } from '@/src/assets/icon';
import { StatCard01 } from '@/src/components/ui/StatCard01';

export function SupplyDashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard01
          icon={<PakageIcon width={24} />}
          value="24"
          label="Total listings"
        />
        <StatCard01
          icon={<PakageIcon width={24} />}
          value="6"
          label="Active orders"
        />
        <StatCard01
          icon={<PakageIcon width={24} />}
          value="₦1.2M"
          label="Revenue (month)"
        />
        <StatCard01
          icon={<PakageIcon width={24} />}
          value="₦180K"
          label="Pending payments"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">
          Top performing products
        </p>
        <div className="bg-bg-surface rounded-[8px]">
          {['Rice (50kg bag)', 'Cooking oil (5L)'].map((name) => (
            <div
              key={name}
              className="flex justify-between px-4 py-3 border-b border-[#9B9EA34D] last:border-0"
            >
              <p className="text-xs font-medium text-text-default">{name}</p>
              <p className="text-xs text-text-muted">42 sold</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">
          Recent orders
        </p>
        <div className="bg-bg-surface rounded-[8px]">
          {['ORD-2201', 'ORD-2198'].map((id) => (
            <div
              key={id}
              className="flex justify-between px-4 py-3 border-b border-[#9B9EA34D] last:border-0"
            >
              <p className="text-xs font-medium text-text-default">{id}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
