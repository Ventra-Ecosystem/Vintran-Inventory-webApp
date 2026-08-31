'use client';

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TitlePart {
  text: string;
  highlight?: boolean;
}

interface IOnboardingSlide {
  id: string;
  titleParts: TitlePart[];
  subtitle: string;
  visual: any;
}

import onboarding1 from '@/src/assets/images/onboarding1.png';
import onboarding2 from '@/src/assets/images/onboarding2.png';
import onboarding3 from '@/src/assets/images/onboarding3.png';
import onboarding4 from '@/src/assets/images/onboarding4.png';

const ONBOARDING_SLIDES: IOnboardingSlide[] = [
  {
    id: 'slide-1',
    titleParts: [
      { text: 'Every ' },
      { text: 'product.', highlight: true },
      { text: '\nEvery ' },
      { text: 'branch.', highlight: true },
      { text: '\nEvery ' },
      { text: 'sale.', highlight: true },
    ],
    subtitle:
      'The inventory platform built for businesses serious about growing — without losing track.',
    visual: onboarding1,
  },
  {
    id: 'slide-2',
    titleParts: [
      { text: 'Your ' },
      { text: 'stock', highlight: true },
      { text: ', always\nwhere you need it' },
    ],
    subtitle:
      'Add products, scan barcodes, move goods between branches, and get alerted before you run low or stock expires.',
    visual: onboarding2,
  },
  {
    id: 'slide-3',
    titleParts: [
      { text: "Know what you've\n" },
      { text: 'earned.', highlight: true },
      { text: ' Know what\n' },
      { text: "you're " },
      { text: 'owed.', highlight: true },
    ],
    subtitle:
      'Track daily profit, log every expense, and follow up on customer debt — all from a live dashboard that gives a real picture of your business.',
    visual: onboarding3,
  },
  {
    id: 'slide-4',
    titleParts: [
      { text: 'One ' },
      { text: 'platform.', highlight: true },
      { text: '\nEvery branch.\nEvery ' },
      { text: 'role.', highlight: true },
    ],
    subtitle:
      'Assign staff to outlets, set role-based permissions, track commissions, and review activity logs — whether you run one shop or ten.',
    visual: onboarding4,
  },
];

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] bg-[#EEF2FF] flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large circle top-right */}
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#E5EDFF] opacity-60" />
          {/* Small circle bottom-left */}
          <div className="absolute top-[40%] -left-[10%] w-[320px] h-[320px] rounded-full bg-[#E5EDFF] opacity-60" />
          <div className="absolute -bottom-24 -left-10 w-[420px] h-[420px] rounded-full bg-[#E5EDFF] opacity-60" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-xl bg-[#0055FF] flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">V</span>
            </div>
            <span className="text-[#0A0D14] font-bold text-xl tracking-tight">Vintran</span>
          </Link>
        </div>

        {/* Slider Content */}
        <div className="relative z-10 flex-1 flex flex-col py-8 mt-4">
          <div className="relative w-full flex-1 flex items-stretch justify-center min-h-[500px]">
            {ONBOARDING_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Text section */}
                <div className="pt-4">
                  <h2 className="text-[36px] leading-[44px] font-extrabold text-[#0A0D14] tracking-tight whitespace-pre-line">
                    {slide.titleParts.map((part, i) => (
                      <span key={i} className={part.highlight ? 'text-[#0055FF]' : ''}>
                        {part.text}
                      </span>
                    ))}
                  </h2>
                  <p className="text-[#64748B] text-[15px] leading-relaxed mt-4 max-w-md font-medium">
                    {slide.subtitle}
                  </p>
                </div>

                {/* Visual section */}
                <div className="relative flex-1 mt-8 w-full flex items-end justify-center overflow-hidden">
                  <Image
                    src={slide.visual}
                    alt="Onboarding Visual"
                    className="object-contain object-bottom max-h-[115%] w-auto max-w-[130%]"
                    priority={index === 0}
                  />
                  {/* Fade from transparent → bg at the bottom to blend */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EEF2FF] to-transparent pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {ONBOARDING_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-7 bg-[#0055FF]' : 'w-1.5 bg-[#A3B8E8]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 mt-6">
          <p className="text-[#64748B] text-xs font-medium">© {new Date().getFullYear()} Vintran. All rights reserved.</p>
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
            <p className="text-sm text-neutral-500 mb-7 leading-relaxed">{subtitle}</p>
          )}
          {!subtitle && <div className="mb-7" />}
          {children}
        </div>
      </div>
    </div>
  );
}
