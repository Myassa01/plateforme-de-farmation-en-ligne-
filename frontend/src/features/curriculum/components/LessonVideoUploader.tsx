import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { useUploadVideo } from '../hooks'

interface LessonVideoUploaderProps {
  courseId: string
  lessonId: string
  hasVideo: boolean
}

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

export function LessonVideoUploader({ courseId, lessonId, hasVideo }: LessonVideoUploaderProps) {
  const uploadVideo = useUploadVideo(courseId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format non supporté. Utilisez un fichier .mp4, .webm ou .ogg.')
      return
    }

    setError(null)
    setProgress(0)
    uploadVideo.mutate(
      { lessonId, file, onProgress: setProgress },
      {
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="ghost"
        className="py-1! text-xs"
        isLoading={uploadVideo.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {hasVideo ? 'Remplacer la vidéo' : 'Importer une vidéo depuis mon PC'}
      </Button>
      {uploadVideo.isPending && (
        <span className="text-xs text-slate-500">{progress}%</span>
      )}
      {hasVideo && !uploadVideo.isPending && (
        <span className="text-xs text-green-600">Vidéo ajoutée</span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
