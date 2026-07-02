'use client'

import { useRouter } from 'next/navigation'
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen'
import { Button } from '@/src/components/ui/Button'
import { LinkButton } from '@/src/components/ui/LinkButton'
import { useReceiptStore } from '@/src/store/receiptStore'

export default function ReceiveSuccessPage() {
  const router = useRouter()
  const lastReceipt = useReceiptStore((s) => s.lastReceipt)

  const details = lastReceipt
    ? Object.entries(lastReceipt).map(([label, value]) => ({ label, value }))
    : []

  return (
    <SuccessScreen
      title="Receipt confirmed"
      subtitle="Stock has been added to your inventory."
      details={details}
      primaryAction={
        <Button fullWidth size="lg" onClick={() => router.push('/warehouse-management')}>
          Receive another product
        </Button>
      }
      secondaryAction={
        <LinkButton href="/home/dashboard" variant="secondary" size="lg" fullWidth>
          Proceed to dashboard
        </LinkButton>
      }
    />
  )
}