import { useState } from 'react'
import { Button } from '@/components/Button'
import { formatPrice } from '@/features/courses/utils'
import { usePayForCourse } from '../hooks'

interface PaymentModalProps {
  courseId: string
  courseTitle: string
  price: string
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ courseId, courseTitle, price, onClose, onSuccess }: PaymentModalProps) {
  const payForCourse = usePayForCourse()
  const [cardNumber, setCardNumber] = useState('')

  const isFree = Number(price) === 0

  const handlePay = () => {
    payForCourse.mutate(courseId, { onSuccess })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {isFree ? "Confirmer l'inscription" : 'Paiement'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{courseTitle}</p>

        <div className="mt-4 flex items-center justify-between border-t border-b border-slate-100 py-3">
          <span className="text-sm text-slate-600">Total</span>
          <span className="text-lg font-bold text-slate-900">{formatPrice(price)}</span>
        </div>

        {!isFree && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="card-number" className="text-sm font-medium text-slate-700">
                Numéro de carte (simulation)
              </label>
              <input
                id="card-number"
                type="text"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Paiement simulé à des fins de démonstration — aucune transaction réelle, aucune
              donnée bancaire n'est enregistrée.
            </p>
          </div>
        )}

        {payForCourse.isError && (
          <p className="mt-3 text-sm text-red-600">{payForCourse.error.message}</p>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={payForCourse.isPending}>
            Annuler
          </Button>
          <Button variant="primary" isLoading={payForCourse.isPending} onClick={handlePay}>
            {isFree ? "S'inscrire" : 'Payer et accéder à la formation'}
          </Button>
        </div>
      </div>
    </div>
  )
}
