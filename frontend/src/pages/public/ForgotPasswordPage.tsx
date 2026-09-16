import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas'

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const forgotPassword = useForgotPassword()

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values.email)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-600">
            LearnHub
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-slate-600">
            Saisissez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {forgotPassword.isSuccess ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-700">
              Si un compte existe avec cette adresse, un email contenant un lien de
              réinitialisation vient de vous être envoyé.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {forgotPassword.isError && (
              <p className="text-sm text-red-600">{forgotPassword.error.message}</p>
            )}

            <Button type="submit" isLoading={forgotPassword.isPending} className="mt-2 w-full">
              Envoyer le lien
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
