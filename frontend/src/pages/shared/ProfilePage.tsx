import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'
import { TextField } from '@/components/TextField'
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile'
import { useAuth } from '@/hooks/useAuth'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().max(1000, 'La bio ne peut pas dépasser 1000 caractères').optional(),
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
    defaultValues: { full_name: user?.full_name ?? '', bio: user?.bio ?? '' },
  })

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values)
  }

  if (!user) return null

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-xl font-semibold text-brand-600">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.email}</p>
            <p className="text-sm text-slate-500">{roleLabels[user.role] ?? user.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <TextField
            label="Nom complet"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <TextArea
            label="Bio"
            placeholder="Parlez un peu de vous..."
            error={errors.bio?.message}
            {...register('bio')}
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
