import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background px-4 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center">
        <div className="flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:text-left">
          <Typography.H1 className="max-w-2xl sm:text-left">
            LinkedIn Posts
          </Typography.H1>
          <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
            <p className="text-xs text-muted-foreground">
              {user?.name ? `${user.name} · ` : null}
              {user?.email}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={logout}>
              Esci
            </Button>
          </div>
        </div>
        <Typography.Lead className="mt-4 max-w-xl">
          Pianifica, scrivi e pubblica i tuoi post con uno stile coerente e meno
          attrito nel flusso di lavoro.
        </Typography.Lead>

        <div className="mt-12 grid w-full max-w-2xl gap-4 sm:grid-cols-2 sm:gap-6">
          <Card className="text-left">
            <CardHeader>
              <CardTitle>Bozze</CardTitle>
              <CardDescription>
                Accumula idee e varianti prima di andare live.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Struttura i post per tema, call to action e tono di voce del brand.
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>
                Allinea contenuti e finestre di pubblicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Tieni sotto controllo date e ricorrenze senza saltare i momenti
              importanti.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
