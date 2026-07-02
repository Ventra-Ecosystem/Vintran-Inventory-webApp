'use client';

import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-[#0D0D0D3D] backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white p-padding transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex justify-center pb-4">
          <div className="w-[48px] h-1 rounded-[160px] bg-[#C5C7CA]"></div>
        </div>
        {children}
      </div>
    </>
  );
}
