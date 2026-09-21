import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile'
import { useAuth } from '@/hooks/useAuth'
import { resolveMediaUrl } from '@/utils/media'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const roleLabels: Record<string, string> = {
  student: 'Étudiant',
  instructor: 'Instructeur',
  admin: 'Administrateur',
}

export function ProfilePage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? '' },
  })

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values)
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 px-6 py-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-2xl font-semibold text-white ring-4 ring-white/30">
              {user.avatar_url ? (
                <img
                  src={resolveMediaUrl(user.avatar_url) ?? undefined}
                  alt={user.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 text-white">
              <p className="truncate text-lg font-semibold">{user.full_name}</p>
              <p className="truncate text-sm text-white/80">{user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {roleLabels[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
          <TextField
            label="Nom complet"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          {updateProfile.isSuccess && (
            <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>
          )}
          {updateProfile.isError && (
            <p className="text-sm text-red-600">{updateProfile.error.message}</p>
          )}

          <Button type="submit" isLoading={updateProfile.isPending} className="mt-2 w-fit">
            Enregistrer
          </Button>
        </form>
      </div>
    </div>
  )
}
