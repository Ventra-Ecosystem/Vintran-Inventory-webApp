'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { loginSchema, type LoginFormValues } from '@/src/components/auth/loginSchema';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const { setTokens, setTwoFactorPending } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const responseData = res.data;

      if (responseData.twoFactorRequired && responseData.verifyToken) {
        setTwoFactorPending(responseData.verifyToken);
        handleApiSuccess('2FA code required. Please check your verification app/email.');
        router.push('/login/verify-2fa');
        return;
      }

      if (responseData.tokens) {
        setTokens(responseData.tokens);
        handleApiSuccess('Successfully logged in!');

        const destination = nextUrl
          ? decodeURIComponent(nextUrl)
          : responseData.tokens.hasBusiness
          ? '/dashboard'
          : '/no-business';

        // SPA navigation without hard refresh
        router.push(destination);
      }
    } catch (err) {
      handleApiError(err, { setError, fallback: 'Login failed. Please check your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Sign in to manage multi-branch inventory, track sales, and monitor debt."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col h-full justify-between">
        <div className="space-y-3">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
          <p className="mt-4 text-center text-sm text-neutral-500">
            Are you a new user?{' '}
            <Link href="/register" className="font-medium text-brand hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-white text-neutral-500">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
