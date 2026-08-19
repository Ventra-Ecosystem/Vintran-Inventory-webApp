'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import {
  ArrowRightIcon,
  CheckMarkIcon,
  GreenCheckIcon,
  NigeriaIcon,
  PakageIcon,
  Store02Icon,
} from '@/src/assets/icon';
import { cn } from '@/src/lib/utils';
import type { Supplier } from './types';
import { useTabBar } from '@/src/hooks/useTabBar';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { Badge } from '@/src/components/ui/Badge';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

const vintranUsers: Supplier[] = [
  { id: 'v1', name: 'Kola Foods NG', contact: 'Kolawole Ade', phone: '+234 810 000 0011', email: 'kola@kolafoods.ng', address: 'Ibadan, Nigeria', category: 'Pantry', isVintran: true },
  { id: 'v2', name: 'Sunrise Traders', contact: 'Fatima Bello', phone: '+234 802 000 0022', email: 'fatima@sunrise.ng', address: 'Kano, Nigeria', category: 'Grains', isVintran: true },
];

type SupplierType = 'external' | 'vintran';

interface AddSupplierViewProps {
  onSaved: () => void;
  onCancel: () => void;
  onViewProfile: (supplier: Supplier) => void;
}

export function AddSupplierView({ onSaved, onCancel, onViewProfile }: AddSupplierViewProps) {
  useTabBar(false);
  const [type, setType] = useState<SupplierType>('external');
  const [vintranQuery, setVintranQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredVintran = vintranUsers.filter((u) =>
    u.name.toLowerCase().includes(vintranQuery.toLowerCase())
  );

  const handleExternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    if (!name?.trim()) { toast.error('Supplier name is required'); return; }
    setSubmitting(true);
    try {
      await suppliersApi.create({
        name: name.trim(),
        contactPerson: (fd.get('contact') as string) || undefined,
        phone: (fd.get('phone') as string) || undefined,
        email: (fd.get('email') as string) || undefined,
        address: (fd.get('address') as string) || undefined,
      });
      toast.success('Supplier added');
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 my-4 ">
        {(['external', 'vintran'] as SupplierType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'flex-1 rounded-lg py-3 px-4 text-xs text-left font-semibold transition-colors',
              type === t ? 'bg-brand-lighter text-brand' : 'text-[#6D7075]'
            )}
          >
            {t === 'external' ? (
              <div className="space-y-1">
                <Store02Icon width={28} />
                <p
                  className={cn(
                    'font-semibold text-xs',
                    type === t ? 'text-brand-dark' : 'text-text-subtle'
                  )}
                >
                  External supplier
                </p>
                <p
                  className={cn(
                    'font-medium text-[10px]',
                    type === t ? 'text-brand-dark' : 'text-text-subtle'
                  )}
                >
                  Not on vintran
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <CheckMarkIcon width={28} />
                <p
                  className={cn(
                    'font-semibold text-xs',
                    type === t ? 'text-brand-dark' : 'text-text-subtle'
                  )}
                >
                  Vintran Business{' '}
                </p>
                <p
                  className={cn(
                    'font-medium text-[10px]',
                    type === t ? 'text-brand-dark' : 'text-text-subtle'
                  )}
                >
                  Verified and connected
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {type === 'external' ? (
        <form
          onSubmit={handleExternalSubmit}
          noValidate
          className="space-y-4 pt-2"
        >
          <Input
            label="Supplier / Business name"
            name="name"
            required
            placeholder="eg Techglobe business"
          />
          <Input
            label="Contact person"
            name="contact"
            required
            placeholder="Full name"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            required
            placeholder="+234 000 000 0000"
            icon={<NigeriaIcon width={24} />}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            required
            placeholder="johndoe@gmail.com"
          />
          <Input
            label="Address"
            name="address"
            required
            placeholder="Street, city,state"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Product category supplied
            </label>

            <Dropdown
              options={[]}
              onChange={() => {}}
              value={'Select category'}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 pb-2">
            <Button variant="primary" fullWidth size="lg" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save supplier'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="px-4 h-11 bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4">
            <Search size={20} />
            <input
              value={vintranQuery}
              onChange={(e) => setVintranQuery(e.target.value)}
              type="text"
              placeholder="Search suppliers..."
              className="flex-1 flex h-full outline-0"
            />
          </div>

          <div className="bg-bg-surface rounded-[8px]">
            {filteredVintran.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-[#9B9EA34D] px-4 py-3 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-brand-lighter flex items-center justify-center">
                    <PakageIcon width={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-default">
                      {user.name}
                    </p>
                    <div>
                      <Badge
                        style={{ backgroundColor: '#C2D6FF' }}
                        textStyle={{ color: '#162664' }}
                      >
                        Electronics
                      </Badge>
                      <Badge
                        style={{ backgroundColor: '#CBF5E5' }}
                        textStyle={{ color: '#176448' }}
                        leftIcon={<GreenCheckIcon />}
                      >
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onViewProfile(user)}
                  className="text-xs flex items-center rounded-[16px] font-medium text-white bg-brand py-1 px-1.5"
                >
                  View
                  <ArrowRightIcon width={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
