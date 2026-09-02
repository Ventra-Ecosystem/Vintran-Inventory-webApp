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

const PASSWORD_REQUIREMENTS: { label: string; test: (v: string) => boolean }[] = [
  { label: 'At least 8 characters',       test: (v) => v.length >= 8 },
  { label: 'One uppercase letter (A–Z)',   test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter (a–z)',   test: (v) => /[a-z]/.test(v) },
  { label: 'One number (0–9)',             test: (v) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

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

        {/* Password with live requirement checklist */}
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="············"
            error={errors.password?.message}
            {...register('password')}
            onChange={(e) => {
              setPassword(e.target.value);
              register('password').onChange(e);
            }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={(e) => {
              setPasswordFocused(false);
              register('password').onBlur(e);
            }}
          />
          {passwordFocused && password.length > 0 && (() => {
            // Show only the first unmet requirement — one at a time
            const next = PASSWORD_REQUIREMENTS.find(({ test }) => !test(password));
            if (!next) return null;
            return (
              <div className="mt-2 flex items-center gap-1.5 pl-1">
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] shrink-0 bg-red-50 text-red-500">✕</span>
                <span className="text-xs text-red-500">{next.label}</span>
              </div>
            );
          })()}
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
