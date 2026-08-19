'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { NigeriaIcon, NoticeIcon } from '@/src/assets/icon';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

interface CategoryOption {
  id: string;
  name: string;
  sortOrder: number;
}

export default function CreateBusinessPage() {
  const router = useRouter();
  const { setBusiness } = useAuthStore();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await authApi.getBusinessCategories();
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch {
        // Fallback default categories if API fetch is unavailable
        setCategories([
          { id: 'retail', name: 'Retail', sortOrder: 1 },
          { id: 'wholesale', name: 'Wholesale', sortOrder: 2 },
          { id: 'manufacturing', name: 'Manufacturing', sortOrder: 3 },
          { id: 'services', name: 'Services', sortOrder: 4 },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const businessName = (formData.get('businessName') as string)?.trim();
    const categoryId = formData.get('categoryId') as string;
    const country = (formData.get('country') as string)?.trim();
    const state = (formData.get('state') as string)?.trim();
    const city = (formData.get('city') as string)?.trim();
    const address = (formData.get('address') as string)?.trim();

    if (!businessName) {
      handleApiError('Business name is required.');
      setIsSubmitting(false);
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);

    try {
      const res = await authApi.registerBusiness({
        businessName,
        categoryId: categoryId || undefined,
        categoryName: selectedCategory?.name || undefined,
        country: country || 'Nigeria',
        state: state || undefined,
        city: city || undefined,
        address: address || undefined,
        currency: 'NGN',
      });

      const resData = res.data as any;
      setBusiness({
        businessId: resData?.id ?? resData?.businessId,
        businessName,
      });

      handleApiSuccess('Business created successfully! Welcome to Vintran.');
      router.push('/dashboard');
    } catch (err) {
      handleApiError(err, { fallback: 'Failed to create business. Please check your details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col justify-center px-padding py-6 bg-white">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-xl font-semibold text-text-default">
          Create New Business
        </h1>
        <p className="mt-1 text-sm font-normal text-text-subtle">
          Add a new business to your account to start managing stock and sales
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Business name"
            name="businessName"
            required
            placeholder="e.g. Vintran Global Stores"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">
              Business category
            </label>
            <select
              name="categoryId"
              required
              disabled={loadingCategories}
              className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-base text-neutral-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-primary-alpha-10 bg-white"
            >
              <option value="">
                {loadingCategories ? 'Loading categories…' : 'Select category'}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Currency"
              placeholder="Nigerian Naira (NGN)"
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
            placeholder="e.g. Lagos"
          />
          <Input
            label="City"
            name="city"
            required
            placeholder="e.g. Ikeja"
          />
          <Input
            label="Business Address (optional)"
            name="address"
            placeholder="Enter physical address"
          />

          <div className="bg-bg-surface px-3.5 py-4 rounded-[10px] mt-6">
            <div className="flex gap-2 items-start">
              <div className="mt-0.5">
                <NoticeIcon />
              </div>
              <p className="text-strong-950 font-medium text-sm">
                You can change any of these details and add multi-branch outlets later in business settings.
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
