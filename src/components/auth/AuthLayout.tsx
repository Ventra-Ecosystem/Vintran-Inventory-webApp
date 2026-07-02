import { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="h-screen w-screen px-padding py-6 bg-white">
      <div className="h-full flex-col flex">
        <h1 className="text-xl font-semibold text-text-default">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-subtle font-normal">{subtitle}</p>
        )}
        <div className="mt-7 flex-1">{children}</div>
      </div>
    </main>
  );
}
