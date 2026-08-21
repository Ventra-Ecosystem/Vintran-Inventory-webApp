import { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] bg-[#0055FF] flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large circle top-right */}
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-white/5" />
          {/* Small circle bottom-left */}
          <div className="absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full bg-white/5" />
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <span className="text-[#0055FF] font-black text-lg leading-none">V</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Vintran</span>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          {/* Feature cards */}
          <div className="space-y-4 mb-10">
            {[
              {
                icon: '📦',
                title: 'Multi-branch Inventory',
                desc: 'Track stock across all your warehouses and stores in real time.',
              },
              {
                icon: '💰',
                title: 'Sales & Debt Tracking',
                desc: 'Record sales, manage customer credit, and monitor revenue.',
              },
              {
                icon: '📊',
                title: 'Business Insights',
                desc: 'Deep analytics on products, suppliers, staff, and finances.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4"
              >
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Vintran. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 xl:px-20 bg-white overflow-y-auto">
        {/* Mobile logo — only on small screens */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#0055FF] flex items-center justify-center">
            <span className="text-white font-black text-base leading-none">V</span>
          </div>
          <span className="text-[#0A0D14] font-bold text-lg tracking-tight">Vintran</span>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <h1 className="text-2xl font-bold text-[#0A0D14] mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-subtle mb-7 leading-relaxed">{subtitle}</p>
          )}
          {!subtitle && <div className="mb-7" />}
          {children}
        </div>
      </div>
    </div>
  );
}
