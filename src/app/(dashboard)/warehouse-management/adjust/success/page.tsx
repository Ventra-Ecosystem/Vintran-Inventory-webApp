'use client'

import { useRouter } from 'next/navigation'
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen'
import { Button } from '@/src/components/ui/Button'
import { LinkButton } from '@/src/components/ui/LinkButton'
import { useReceiptStore } from '@/src/store/receiptStore'

export default function AdjustSuccessPage() {
  const router = useRouter()
  const lastAdjustment = useReceiptStore((s) => s.lastAdjustment)

  const details = lastAdjustment
    ? Object.entries(lastAdjustment).map(([label, value]) => ({ label, value }))
    : []

  return (
    <SuccessScreen
      title="Adjustment confirmed"
      subtitle="Inventory count has been updated."
      details={details}
      primaryAction={
        <Button fullWidth size="lg" onClick={() => router.push('/warehouse-management')}>
          Make another adjustment
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