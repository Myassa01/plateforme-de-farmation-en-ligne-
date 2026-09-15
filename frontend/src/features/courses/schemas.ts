import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category_id: z.string().min(1, 'Choisissez une catégorie'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(1, 'La langue est requise'),
  price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
})

export type CreateCourseFormInput = z.input<typeof createCourseSchema>
export type CreateCourseFormValues = z.output<typeof createCourseSchema>
