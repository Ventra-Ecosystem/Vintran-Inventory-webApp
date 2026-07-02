'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { NigeriaIcon, NoticeIcon } from '@/src/assets/icon';

export default function CreateBusinessPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      businessName: formData.get('businessName'),
      category: formData.get('category'),
      currency: formData.get('currency'),
      country: formData.get('country'),
      state: formData.get('state'),
      city: formData.get('city'),
    };

    try {
      // TODO: replace with real API call
      console.log('create business payload', payload);
      router.push('/home/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col justify-center px-padding py-6">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-xl font-semibold text-text-default">
          Create New Business
        </h1>
        <p className="mt-1 text-sm font-normal text-text-subtle">
          Add a new business to your account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Business name"
            name="businessName"
            required
            placeholder="Enter business name"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Category
            </label>
            <select
              name="category"
              required
              className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-base text-neutral-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10"
            >
              <option value="">Select category</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Input
              label="Currency"
              placeholder="Nigerian naira"
              disabled
              icon={<NigeriaIcon />}
            />
          </div>

          <Input
            label="Country"
            name="country"
            required
            defaultValue="Nigeria"
          />
          <Input
            label="State"
            name="state"
            required
            placeholder="Enter your state"
          />
          <Input
            label="City"
            name="city"
            required
            placeholder="Enter your city"
          />

          <div className="bg-bg-surface px-3.5 py-4 rounded-[10px] mt-6">
            <div className="flex gap-2">
              <div>
                <NoticeIcon />
              </div>
              <p className="text-strong-950 font-medium text-sm">
                You can change any of these details and add more information in
                business settings
              </p>
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Business…' : 'Create Business'}
          </Button>
        </form>
      </div>
    </main>
  );
}
