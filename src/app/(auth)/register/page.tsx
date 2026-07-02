// src/app/(auth)/register/page.tsx
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

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // TODO: replace with real API call
      // await api.post('/auth/register', data)
      console.log('register payload', data);
      router.push('/login');
    } catch (err) {
      setServerError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account to continue"
      subtitle="Sign up to get started"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="First name"
          placeholder="Enter your first name here"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last name"
          placeholder="Enter your last name here"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
        <Input
          label="Email"
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
          placeholder="• • • • • • • •"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="• • • • • • • •"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label="Referral code (optional)"
          placeholder="Referral code"
          error={errors.referralCode?.message}
          {...register('referralCode')}
        />

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
