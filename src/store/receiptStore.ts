import { create } from 'zustand'

interface ReceiptDetails {
  [key: string]: string
}

interface ReceiptState {
  lastReceipt: ReceiptDetails | null
  lastTransfer: ReceiptDetails | null
  lastAdjustment: ReceiptDetails | null
  setLastReceipt: (details: ReceiptDetails) => void
  setLastTransfer: (details: ReceiptDetails) => void
  setLastAdjustment: (details: ReceiptDetails) => void
}

export const useReceiptStore = create<ReceiptState>((set) => ({
  lastReceipt: null,
  lastTransfer: null,
  lastAdjustment: null,
  setLastReceipt: (details) => set({ lastReceipt: details }),
  setLastTransfer: (details) => set({ lastTransfer: details }),
  setLastAdjustment: (details) => set({ lastAdjustment: details }),
}))