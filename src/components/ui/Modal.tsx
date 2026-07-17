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
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white p-padding transition-transform duration-300 ease-in-out shadow-[-10px_0_40px_rgba(0,0,0,0.1)] overflow-y-auto sm:rounded-l-[24px]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {children}
      </div>
    </>
  );
}
