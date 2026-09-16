import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'
import { TextField } from '@/components/TextField'
import { useCategories } from '@/features/categories/useCategories'
import { createCourseSchema, type CreateCourseFormInput, type CreateCourseFormValues } from '../schemas'

interface CourseFormProps {
  onSubmit: (values: CreateCourseFormValues) => void
  isSubmitting: boolean
  submitError?: string
  submitLabel?: string
}

export function CourseForm({
  onSubmit,
  isSubmitting,
  submitError,
  submitLabel = 'Créer la formation',
}: CourseFormProps) {
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseFormInput, unknown, CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { level: 'beginner', language: 'French', price: 0 },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
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
        {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
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

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
