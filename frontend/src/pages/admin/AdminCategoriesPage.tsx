import { useState } from 'react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/hooks'
import { useCategories } from '@/features/categories/useCategories'
import type { Category } from '@/features/categories/types'

export function AdminCategoriesPage() {
  const { data, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    createCategory.mutate(
      { name, description: description || undefined },
      {
        onSuccess: () => {
          setName('')
          setDescription('')
        },
      },
    )
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const saveEditing = (id: string) => {
    if (!editingName.trim()) return
    updateCategory.mutate(
      { id, payload: { name: editingName } },
      { onSuccess: () => setEditingId(null) },
    )
  }

  const handleDelete = (category: Category) => {
    if (window.confirm(`Supprimer la catégorie "${category.name}" ?`)) {
      deleteCategory.mutate(category.id)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Catégories</h1>
      <p className="mt-1 text-sm text-slate-600">
        Gérez les catégories utilisées pour classer les formations.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <h2 className="text-sm font-semibold text-slate-900">Ajouter une catégorie</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nom de la catégorie"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <Button type="submit" isLoading={createCategory.isPending}>
            Ajouter
          </Button>
        </div>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optionnelle)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        {createCategory.isError && (
          <p className="text-sm text-red-600">{createCategory.error.message}</p>
        )}
      </form>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState
            title="Aucune catégorie pour le moment"
            description="Ajoutez une première catégorie pour permettre aux instructeurs de classer leurs formations."
          />
        )}

        {data && data.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200"
              >
                {editingId === category.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="w-full max-w-xs rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-900">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-slate-500">{category.description}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {editingId === category.id ? (
                    <Button
                      variant="secondary"
                      isLoading={updateCategory.isPending}
                      onClick={() => saveEditing(category.id)}
                    >
                      Enregistrer
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(category)}>
                      Modifier
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    isLoading={deleteCategory.isPending}
                    onClick={() => handleDelete(category)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
