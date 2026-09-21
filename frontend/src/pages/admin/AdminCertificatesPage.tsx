import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useAdminUsers } from '@/features/admin/hooks'
import {
  useAllCertificates,
  useCertificateSettings,
  useCreateCertificate,
  useUploadCertificateBackground,
} from '@/features/certificates/hooks'
import { useCourses } from '@/features/courses/hooks/useCourses'

export function AdminCertificatesPage() {
  const { data: students, isLoading: isLoadingStudents } = useAdminUsers({
    role: 'student',
    page_size: 100,
  })
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({
    page_size: 50,
  })
  const { data: certificates, isLoading: isLoadingCertificates } = useAllCertificates()
  const createCertificate = useCreateCertificate()
  const { data: certificateSettings } = useCertificateSettings()
  const uploadBackground = useUploadCertificateBackground()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    uploadBackground.mutate(file)
    event.target.value = ''
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!studentId || !courseId) return
    createCertificate.mutate(
      { student_id: studentId, course_id: courseId },
      {
        onSuccess: () => {
          setStudentId('')
          setCourseId('')
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Certificats</h1>
      <p className="mt-1 text-sm text-slate-600">
        Délivrez un certificat à un étudiant pour une formation. Il apparaîtra sur son profil.
      </p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Design du certificat</h2>
        <p className="mt-1 text-xs text-slate-500">
          Importez une image (PNG, JPG ou WEBP, 5 Mo max) à utiliser comme fond pour tous les
          certificats délivrés.
        </p>

        <div className="mt-3 flex items-center gap-4">
          {certificateSettings?.background_url ? (
            <img
              src={certificateSettings.background_url}
              alt="Aperçu du design du certificat"
              className="h-24 w-40 rounded-lg object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 ring-1 ring-slate-200">
              Aucun design
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleBackgroundChange}
            />
            <Button
              type="button"
              variant="secondary"
              isLoading={uploadBackground.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {certificateSettings?.background_url ? 'Remplacer l’image' : 'Importer une image'}
            </Button>
            {uploadBackground.isError && (
              <p className="mt-2 text-sm text-red-600">{uploadBackground.error.message}</p>
            )}
            {uploadBackground.isSuccess && (
              <p className="mt-2 text-sm text-green-600">Design mis à jour avec succès.</p>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <h2 className="text-sm font-semibold text-slate-900">Délivrer un certificat</h2>

        <div>
          <label className="text-xs font-medium text-slate-600">Étudiant</label>
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            disabled={isLoadingStudents}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sélectionner un étudiant</option>
            {students?.items.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Formation</label>
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            disabled={isLoadingCourses}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sélectionner une formation</option>
            {coursesData?.items.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          isLoading={createCertificate.isPending}
          disabled={!studentId || !courseId}
          className="self-start"
        >
          Délivrer le certificat
        </Button>

        {createCertificate.isError && (
          <p className="text-sm text-red-600">{createCertificate.error.message}</p>
        )}
        {createCertificate.isSuccess && (
          <p className="text-sm text-green-600">Certificat délivré avec succès.</p>
        )}
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Certificats délivrés</h2>

        <div className="mt-4">
          {isLoadingCertificates && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          )}

          {certificates && certificates.length === 0 && (
            <EmptyState
              title="Aucun certificat délivré"
              description="Les certificats que vous délivrez apparaîtront ici."
            />
          )}

          {certificates && certificates.length > 0 && (
            <div className="flex flex-col gap-2">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {certificate.student.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{certificate.course.title}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
