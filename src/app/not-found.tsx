import Link from 'next/link'
import type { ReactNode } from 'react'
import fr from '../../messages/fr.json'

export default function NotFound(): ReactNode {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="text-2xl font-bold text-foreground">{fr.notFound.title}</h1>
        <p className="text-muted-foreground">{fr.notFound.message}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {fr.notFound.backToDashboard}
        </Link>
      </div>
    </div>
  )
}
