import { EmptyState } from '@/components/EmptyState'

export function CertificatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mes certificats</h1>

      <div className="mt-6">
        <EmptyState
          title="Aucun certificat pour le moment"
          description="Terminez une formation (toutes les lessons et quiz) pour obtenir votre certificat."
        />
      </div>
    </div>
  )
}
