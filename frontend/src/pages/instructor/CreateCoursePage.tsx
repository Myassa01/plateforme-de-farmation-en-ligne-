import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'
import { TextField } from '@/components/TextField'
import { useCategories } from '@/features/categories/useCategories'
import { useCreateCourse } from '@/features/courses/hooks/useCourseMutations'
import {
  createCourseSchema,
  type CreateCourseFormInput,
  type CreateCourseFormValues,
} from '@/features/courses/schemas'

export function CreateCoursePage() {
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createCourse = useCreateCourse()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseFormInput, unknown, CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { level: 'beginner', language: 'French', price: 0 },
  })

  const onSubmit = (values: CreateCourseFormValues) => {
    createCourse.mutate(values, {
      onSuccess: () => navigate('/instructor/courses'),
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Créer une formation</h1>
      <p className="mt-1 text-sm text-slate-600">
        Votre formation sera créée en brouillon. Vous pourrez la soumettre à validation une fois
        prête.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <TextField label="Titre" error={errors.title?.message} {...register('title')} />
        <TextArea
          label="Description"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="text-sm font-medium text-slate-700">
            Catégorie
          </label>
          <select
            id="category_id"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            {...register('category_id')}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="level" className="text-sm font-medium text-slate-700">
            Niveau
          </label>
          <select
            id="level"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            {...register('level')}
          >
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
        </div>

        <TextField label="Langue" error={errors.language?.message} {...register('language')} />
        <TextField
          label="Prix (EUR)"
          type="number"
          step="0.01"
          min="0"
          error={errors.price?.message}
          {...register('price')}
        />

        {createCourse.isError && (
          <p className="text-sm text-red-600">{createCourse.error.message}</p>
        )}

        <Button type="submit" isLoading={createCourse.isPending} className="mt-2 w-full">
          Créer la formation
        </Button>
      </form>
    </div>
  )
}
