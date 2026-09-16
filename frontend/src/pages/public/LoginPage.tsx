import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'

export function LoginPage() {
  const location = useLocation()
  const locationState = location.state as { justRegistered?: boolean; justReset?: boolean } | null
  const justRegistered = Boolean(locationState?.justRegistered)
  const justReset = Boolean(locationState?.justReset)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const login = useLogin()

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-600">
            LearnHub
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Connexion</h1>
        </div>

        {justRegistered && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Compte créé avec succès, vous pouvez vous connecter.
          </div>
        )}

        {justReset && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Mot de passe réinitialisé avec succès, vous pouvez vous connecter.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Link
            to="/forgot-password"
            className="-mt-2 self-end text-sm font-medium text-brand-600 hover:underline"
          >
            Mot de passe oublié ?
          </Link>

          {login.isError && (
            <p className="text-sm text-red-600">{login.error.message}</p>
          )}

          <Button type="submit" isLoading={login.isPending} className="mt-2 w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
