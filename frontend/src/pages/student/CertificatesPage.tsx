import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCertificateSettings, useMyCertificates } from '@/features/certificates/hooks'

export function CertificatesPage() {
  const { data: certificates, isLoading } = useMyCertificates()
  const { data: certificateSettings } = useCertificateSettings()
  const backgroundUrl = certificateSettings?.background_url

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mes certificats</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        )}

        {certificates && certificates.length === 0 && (
          <EmptyState
            title="Aucun certificat pour le moment"
            description="Terminez une formation pour recevoir un certificat de votre instructeur ou de l'administration."
          />
        )}

        {certificates && certificates.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                style={
                  backgroundUrl
                    ? {
                        backgroundImage: `url(${backgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
                className={
                  backgroundUrl
                    ? 'relative overflow-hidden rounded-2xl p-6 text-white shadow-md'
                    : 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 p-6 text-white shadow-md'
                }
              >
                {backgroundUrl && (
                  <div className="pointer-events-none absolute inset-0 bg-black/35" />
                )}
                {!backgroundUrl && (
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                )}
                <div className="relative">
                  {!backgroundUrl && (
                    <span className="text-3xl" aria-hidden>
                      🏆
                    </span>
                  )}
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/80">
                    Certificat de réussite
                  </p>
                  <h2 className="mt-1 text-lg font-bold">{certificate.course.title}</h2>
                  <p className="mt-2 text-sm text-white/90">
                    Délivré à {certificate.student.full_name}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Le {new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
