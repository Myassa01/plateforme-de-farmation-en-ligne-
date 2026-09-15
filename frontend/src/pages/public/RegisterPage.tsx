import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const registerMutation = useRegister()

  const onSubmit = (values: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...payload } = values
    registerMutation.mutate(payload)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-600">
            LearnHub
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Créer un compte</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <TextField
            label="Nom complet"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Je m'inscris en tant que
            </label>
            <select
              id="role"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              {...register('role')}
            >
              <option value="student">Étudiant</option>
              <option value="instructor">Instructeur</option>
            </select>
          </div>

          <TextField
            label="Mot de passe"
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

          {registerMutation.isError && (
            <p className="text-sm text-red-600">{registerMutation.error.message}</p>
          )}

          <Button type="submit" isLoading={registerMutation.isPending} className="mt-2 w-full">
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
