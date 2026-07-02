import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import {
  NoticeIcon,
  PakageIcon,
  SwitchIcon,
  WareHouseIcon,
} from '@/src/assets/icon';

interface DeactivateLocationViewProps {
  location: { id: string; name: string; address: string };
  confirmChecked: boolean;
  onConfirmCheckedChange: (checked: boolean) => void;
  onBack: () => void;
  onDelete: () => void;
}

export function DeactivateLocationView({
  location,
  confirmChecked,
  onConfirmCheckedChange,
  onBack,
  onDelete,
}: DeactivateLocationViewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-black">
        Deactivate location
      </h2>

      <div className="rounded-[12px] bg-bg-surface p-3 flex items-center gap-4">
        <div>
          <WareHouseIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {location.name}
          </p>
          <p className="text-xs text-text-subtle">{location.address}</p>
          <p className="text-[#BB5902] font-medium text-xs">
            180 units still in stock
          </p>
        </div>
      </div>

      <div className="bg-[#FEF3F2] p-3 rounded-[12px] flex gap-3">
        <NoticeIcon width={40} />
        <p className="text-error-dark font-medium text-sm">
          180 units of stock remain here. Transfer all stock to another location
          before deactivating.
        </p>
      </div>

      <div className="text-brand text-sm font-medium py-3.5 bg-primary-alpha-10 rounded-[10px] flex justify-center gap-2">
        <SwitchIcon width={20} />
        <p>Transfer stock out first</p>
      </div>

      <div className="text-text-muted font-medium text-xs flex gap-2 items-center">
        <span className="flex bg-[#9B9EA3] h-[1px] w-full"></span>

        <p className="whitespace-nowrap">then proceed below</p>

        <span className="flex bg-[#9B9EA3] h-[1px] w-full "></span>
      </div>

      <div className="p-4 bg-bg-surface rounded-[16px]">
        <p className="font-semibold text-sm text-text-subtle">
          What happens on deactivation
        </p>

        <div>
          <div className="flex items-center gap-2 border-b pt-3 pb-2 border-b-[#9B9EA34D]">
            <PakageIcon width={24} />
            <p className="text-text-default text-xs font-medium">
              Removed from the active locations list
            </p>
          </div>
          <div className="flex items-center gap-2 border-b pt-3 pb-2 border-b-[#9B9EA34D]">
            <PakageIcon width={24} />
            <p className="text-text-default text-xs font-medium">
              No new stock can be received here
            </p>
          </div>

          <div className="flex items-center gap-2 border-b pt-3 pb-2 border-b-[#9B9EA34D]">
            <PakageIcon width={24} />
            <p className="text-text-default text-xs font-medium">
              No transfers in or out allowed{' '}
            </p>
          </div>
          <div className="flex items-center gap-2 border-b pt-3 pb-2 border-b-[#9B9EA34D]">
            <PakageIcon width={24} />
            <p className="text-text-default text-xs font-medium">
              All historical records are preserved{' '}
            </p>
          </div>
          <div className="flex items-center gap-2 border-b pt-3 pb-2 border-b-[#9B9EA34D]">
            <PakageIcon width={24} />
            <p className="text-text-default text-xs font-medium">
              Location can be reactivated at any time{' '}
            </p>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-text-subtle">
        <input
          type="checkbox"
          checked={confirmChecked}
          onChange={(e) => onConfirmCheckedChange(e.target.checked)}
        />
        I understand this action cannot be undone
      </label>

      <div className="flex gap-3 ">
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          type="button"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="button"
          disabled={!confirmChecked}
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600"
        >
          Deactivate
        </Button>
      </div>
    </div>
  );
}
