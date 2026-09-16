import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { TextField } from '@/components/TextField'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const resetPassword = useResetPassword()

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) return
    resetPassword.mutate(
      { token, newPassword: values.password },
      {
        onSuccess: () => {
          navigate('/login', { state: { justReset: true } })
        },
      },
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <EmptyState
            title="Lien invalide"
            description="Ce lien de réinitialisation est incomplet. Demandez-en un nouveau."
          />
          <Link
            to="/forgot-password"
            className="mt-4 block text-center text-sm font-medium text-brand-600 hover:underline"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-600">
            LearnHub
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Nouveau mot de passe</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <TextField
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {resetPassword.isError && (
            <p className="text-sm text-red-600">
              Ce lien est invalide ou a expiré. Demandez-en un nouveau.
            </p>
          )}

          <Button type="submit" isLoading={resetPassword.isPending} className="mt-2 w-full">
            Réinitialiser le mot de passe
          </Button>
        </form>
      </div>
    </div>
  )
}
