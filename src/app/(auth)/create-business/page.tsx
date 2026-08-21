'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { CustomSelect } from '@/src/components/ui/CustomSelect';
import { NigeriaIcon, NoticeIcon } from '@/src/assets/icon';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';
import { getAllCountries, getStatesOfCountry, getCitiesOfState } from '@/src/lib/location';

const DEFAULT_CATEGORIES = [
  { id: 'Supermarket / Grocery', name: 'Supermarket / Grocery' },
  { id: 'Fashion & Clothing', name: 'Fashion & Clothing' },
  { id: 'Electronics', name: 'Electronics' },
  { id: 'Pharmacy / Health', name: 'Pharmacy / Health' },
  { id: 'Restaurant / Food', name: 'Restaurant / Food' },
  { id: 'Automobile / Spare Parts', name: 'Automobile / Spare Parts' },
  { id: 'Building Materials', name: 'Building Materials' },
  { id: 'Cosmetics / Beauty', name: 'Cosmetics / Beauty' },
  { id: 'Other', name: 'Other' },
];

export default function CreateBusinessPage() {
  const router = useRouter();
  const { setBusiness } = useAuthStore();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form states matching mobile app
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    authApi.getBusinessCategories()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const countryOptions = useMemo(() => {
    return getAllCountries().map((c) => ({ label: c.label, value: c.id }));
  }, []);

  const stateOptions = useMemo(() => {
    return getStatesOfCountry(country).map((s) => ({ label: s.label, value: s.id }));
  }, [country]);

  const cityOptions = useMemo(() => {
    return getCitiesOfState(country, state).map((c) => ({ label: c.label, value: c.id }));
  }, [country, state]);

  const canSubmit = Boolean(businessName.trim() && categoryId && state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const selectedCategory = categories.find((c) => c.id === categoryId);

    try {
      const res = await authApi.registerBusiness({
        businessName: businessName.trim(),
        categoryId,
        categoryName: selectedCategory?.name || undefined,
        country: country || 'Nigeria',
        state: state || undefined,
        city: city || undefined,
        currency: 'NGN',
      });

      const resData = res.data as any;
      setBusiness({
        businessId: resData?.id ?? resData?.businessId,
        businessName: businessName.trim(),
      });

      handleApiSuccess('Business created successfully! Welcome to Vintran.');
      router.push('/dashboard');
    } catch (err) {
      handleApiError(err, { fallback: 'Failed to create business. Please check your details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  return (
    <AuthLayout
      title="Create New Business"
      subtitle="Add a new business to your account"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Business Name */}
        <Input
          label="Business name *"
          placeholder="Enter business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        {/* Category Dropdown */}
        {loadingCategories ? (
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-11 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
          </div>
        ) : (
          <CustomSelect
            label="Category *"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select category"
            searchable
            searchPlaceholder="Search categories..."
          />
        )}

        {/* Currency (Locked NGN) */}
        <Input
          label="Currency"
          value="Nigerian naira"
          disabled
          icon={<NigeriaIcon className="w-5 h-5 shrink-0" />}
        />

        {/* Country Select */}
        <CustomSelect
          label="Country *"
          options={countryOptions}
          value={country}
          onChange={(val) => {
            setCountry(val);
            setState('');
            setCity('');
          }}
          placeholder="Select Country"
          searchable
          searchPlaceholder="Search countries..."
        />

        {/* State Select */}
        <CustomSelect
          label="State *"
          options={stateOptions}
          value={state}
          onChange={(val) => {
            setState(val);
            setCity('');
          }}
          placeholder="Select state"
          searchable
          searchPlaceholder="Search states..."
        />

        {/* City Select */}
        <CustomSelect
          label="City"
          options={cityOptions}
          value={city}
          onChange={setCity}
          placeholder="Select city"
          searchable
          searchPlaceholder="Search cities..."
        />

        {/* Info Notice Box */}
        <div className="flex items-start gap-3 bg-[#FFF7ED] border border-[#FED7AA] px-3.5 py-3 rounded-xl">
          <NoticeIcon width={20} height={20} className="w-5 h-5 shrink-0 mt-0.5 text-[#92400E]" />
          <p className="text-xs font-medium text-[#92400E] leading-relaxed">
            You can change any of these details and add more information in business settings.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={isSubmitting || !canSubmit}
          className="mt-2"
        >
          {isSubmitting ? 'Creating business…' : 'Create Business'}
        </Button>
      </form>
    </AuthLayout>
  );
}
