import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { DiscoverMenu } from './DiscoverMenu'

interface PublicNavbarProps {
  initialSearch?: string
}

export function PublicNavbar({ initialSearch = '' }: PublicNavbarProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState(initialSearch)

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = search.trim()
    navigate(trimmed ? `/courses?search=${encodeURIComponent(trimmed)}` : '/courses')
  }

  return (
    <nav className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <Link to="/" className="shrink-0 text-xl font-bold text-brand-600">
        LearnHub
      </Link>

      <div className="hidden sm:block">
        <DiscoverMenu />
      </div>

      <form onSubmit={handleSearchSubmit} className="order-last w-full sm:order-none sm:max-w-md sm:flex-1">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une formation..."
          className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Link to="/login">
          <Button variant="ghost">Se connecter</Button>
        </Link>
        <Link to="/register">
          <Button variant="primary">S'inscrire</Button>
        </Link>
      </div>
    </nav>
  )
}
