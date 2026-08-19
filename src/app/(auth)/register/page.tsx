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

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
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

  return (
    <AuthLayout
      title="Create an account to continue"
      subtitle="Sign up to manage multi-branch inventory, sales, and analytics."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="First name"
          placeholder="Enter your first name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last name"
          placeholder="Enter your last name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="janedoe@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="+234 000 000 0000"
          icon={<NigeriaIcon />}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label="Referral code (optional)"
          placeholder="Referral code"
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
