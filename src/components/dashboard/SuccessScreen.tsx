import { ReactNode } from 'react';
import { BgRotatingIcon, SuccessIcon } from '@/src/assets/icon';

interface SuccessScreenProps {
  title: string;
  subtitle?: string;
  details?: { label: string; value: string }[];
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
}

export function SuccessScreen({
  title,
  subtitle,
  details,
  primaryAction,
  secondaryAction,
}: SuccessScreenProps) {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Content */}
      <div className="relative flex-1">
        {/* Background */}
        <BgRotatingIcon className="absolute inset-x-0 top-0 z-0 w-full animate-spin-slow" />

        {/* Hero */}
        <div className="relative z-10 flex flex-col items-center pt-[13vh] px-padding text-center">
          <SuccessIcon />

          <h1 className="mt-4 text-2xl font-semibold text-text-default">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm text-text-subtle">{subtitle}</p>
          )}

          {details && details.length > 0 && (
            <div className="mt-8 w-full max-w-sm rounded-2xl bg-bg-surface p-4 text-left shadow-sm">
              <h2 className="text-sm font-semibold text-text-subtle">
                Receipt Details
              </h2>

              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between border-b border-[#9B9EA34D] py-3 last:border-b-0"
                >
                  <span className="text-xs text-text-subtle">
                    {detail.label}
                  </span>

                  <span className="text-xs font-medium text-text-default">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="space-y-3 px-padding py-6">
        {primaryAction}
        {secondaryAction}
      </div>
    </main>
  );
}
