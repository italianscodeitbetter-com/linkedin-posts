import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background px-4 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center">
        <Typography.H1 className="max-w-2xl">
          LinkedIn Posts
        </Typography.H1>
        <Typography.Lead className="mt-4 max-w-xl">
          Pianifica, scrivi e pubblica i tuoi post con uno stile coerente e
          meno attrito nel flusso di lavoro.
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

export default App
