'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { NigeriaIcon } from '@/src/assets/icon';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/src/components/auth/registerSchema';
import { authApi } from '@/src/lib/api/auth';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

const PASSWORD_REQUIREMENTS = [
  'At least 8 characters',
  'At least one uppercase letter (A–Z)',
  'At least one lowercase letter (a–z)',
  'At least one number (0–9)',
  'At least one special character (e.g. @, #, $)',
];

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await authApi.createAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
        referralCode: data.referralCode || undefined,
      });
      handleApiSuccess('Account created successfully! Please verify your email.');
      router.push(`/register/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      handleApiError(err, { setError, fallback: 'Failed to create account. Please check your details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strip non-alpha characters for name fields
  const handleNameInput = (field: 'firstName' | 'lastName') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 24);
    setValue(field, cleaned, { shouldValidate: true });
  };

  // Strip non-numeric characters for phone
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setValue('phoneNumber', cleaned, { shouldValidate: true });
  };

  return (
    <AuthLayout
      title="Create an account to continue"
      subtitle="Sign up to manage multi-branch inventory, sales, and analytics."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName')}
            onChange={handleNameInput('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            error={errors.lastName?.message}
            {...register('lastName')}
            onChange={handleNameInput('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="janedoe@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone — flag only, no dropdown */}
        <Input
          label="Phone number"
          type="tel"
          placeholder="08000000000"
          icon={<NigeriaIcon />}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
          onChange={handlePhoneInput}
          maxLength={11}
        />

        {/* Password with requirements shown upfront */}
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="············"
            error={errors.password?.message}
            {...register('password')}
          />
          <ul className="mt-1.5 space-y-0.5 pl-1">
            <li className="text-xs text-neutral-500 font-medium">Password must contain:</li>
            {PASSWORD_REQUIREMENTS.map((req) => (
              <li key={req} className="text-xs text-neutral-400 flex items-start gap-1">
                <span>•</span> {req}
              </li>
            ))}
          </ul>
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Referral code — optional */}
        <Input
          label="Referral code (optional)"
          placeholder="Enter referral code"
          error={errors.referralCode?.message}
          {...register('referralCode')}
        />

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
