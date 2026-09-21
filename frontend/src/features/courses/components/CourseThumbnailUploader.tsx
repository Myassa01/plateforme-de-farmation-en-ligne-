import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { useUploadThumbnail } from '../hooks/useCourseMutations'
import { resolveMediaUrl } from '@/utils/media'

interface CourseThumbnailUploaderProps {
  courseId: string
  thumbnailUrl: string | null
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function CourseThumbnailUploader({ courseId, thumbnailUrl }: CourseThumbnailUploaderProps) {
  const uploadThumbnail = useUploadThumbnail(courseId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format non supporté. Utilisez une image .jpg, .png ou .webp.')
      return
    }

    setError(null)
    uploadThumbnail.mutate(file, {
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-sm font-semibold text-slate-900">Image de la formation</h2>
      <p className="mt-1 text-xs text-slate-500">
        Cette image apparaît sur la carte de la formation dans le catalogue.
      </p>

      <div className="mt-3 flex items-center gap-4">
        <div className="aspect-square w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
          {thumbnailUrl ? (
            <img
              src={resolveMediaUrl(thumbnailUrl) ?? undefined}
              alt="Aperçu de la formation"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Pas d'image
            </div>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            isLoading={uploadThumbnail.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {thumbnailUrl ? "Changer l'image" : 'Importer une image depuis mon PC'}
          </Button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
