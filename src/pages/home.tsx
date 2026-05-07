import * as React from 'react'
import {
  AlertTriangleIcon,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Loader2,
  Megaphone,
  MessageCircle,
  PenTool,
  Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generatePostWithAnthropic } from '@/lib/generate-post'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/context/userProfileStore'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useLinkedinStore } from '@/context/linkedinStore'
import { isLinkedInConnected } from '@/lib/linkedin'

const POST_STYLES = [
  { label: 'Professionale', icon: Briefcase },
  { label: 'Storytelling', icon: PenTool },
  { label: 'Tecnico', icon: Wrench },
  { label: 'Ispirazionale', icon: Lightbulb },
  { label: 'Educativo', icon: GraduationCap },
  { label: 'Promozionale', icon: Megaphone },
]
const POST_LENGTH = [
  { label: 'Corto', icon: MessageCircle },
  { label: 'Medio', icon: MessageCircle },
  { label: 'Lungo', icon: MessageCircle },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [selectedStyle, setSelectedStyle] = React.useState(POST_STYLES[0].label)
  const [selectedLength, setSelectedLength] = React.useState(POST_LENGTH[0].label)
  const [prompt, setPrompt] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const { user } = useUserStore()
  const { setIsLinkedinConnected } = useLinkedinStore()

  React.useEffect(() => {
    void isLinkedInConnected().then((isConnected) => setIsLinkedinConnected(isConnected))
    console.log('user', user)
  }, [])

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt.length < 10) {
      toast.error('Inserisci almeno 10 caratteri per generare il post')
      return
    }
    setGenerating(true)
    try {
      const text = await generatePostWithAnthropic({
        prompt: trimmedPrompt,
        style: selectedStyle,
        postlength: selectedLength,
        user,
      })
      navigate('/post-detail', {
        state: {
          generatedText: text,
          style: selectedStyle,
          prompt: trimmedPrompt,
        },
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Errore durante la generazione'
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      {generating ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">
            Generazione in corso…
          </p>
          <p className="text-xs text-muted-foreground">
            Stiamo scrivendo il tuo post con stile <span className="font-semibold">{selectedStyle}</span>
          </p>
        </div>
      ) : null}
      <div className="flex-1 bg-background px-[40px] pb-10" style={{ height: user && user.id ? 'auto' : 'calc(100% - 64px)' }}>
        {!user && <Alert className="w-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
          <AlertTriangleIcon />
          <AlertTitle>Aggiorna le tue informazioni</AlertTitle>
          <AlertDescription>
            Per generare post migliori, aggiorna le tue informazioni nel tuo profilo.
            <Button variant="link" size="sm" onClick={() => navigate('/profile')}>
              Vai al profilo
            </Button>
          </AlertDescription>
        </Alert>}


        <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">

          <div className="w-full max-w-3xl space-y-5">
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-2xl font-semibold tracking-tight">
                Crea il tuo prossimo post LinkedIn
              </h1>
              <p className="text-sm text-muted-foreground">
                Scrivi il tema del contenuto, scegli lo stile e genera un post
                pronto da rifinire e pubblicare.
              </p>
            </div>

            <div className="rounded-none border bg-card p-3 shadow-sm">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Di cosa vuoi scrivere oggi su LinkedIn?"
                className="min-h-36 resize-none rounded-xl border-0 bg-transparent p-3 text-sm focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center justify-between border-t pt-3">
                <div className="flex flex-col gap-2" >
                  <p className="text-xs text-muted-foreground">
                    Stile attivo: <span className="font-bold">{selectedStyle}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lunghezza post: <span className="font-bold">{selectedLength}</span>
                  </p>
                </div>

                <Button type="button" size="sm" onClick={() => void handleGenerate()} disabled={generating}>
                  {generating ? 'Generazione...' : 'Genera post'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {POST_STYLES.map((style) => {
                const isActive = selectedStyle === style.label
                const Icon = style.icon
                return (
                  <Button
                    key={style.label}
                    type="button"
                    size="sm"
                    variant={isActive ? 'secondary' : 'outline'}
                    onClick={() => setSelectedStyle(style.label)}
                    className={cn(
                      'gap-1.5 rounded-none',
                      isActive
                        ? 'bg-primary/10 text-primary hover:bg-primary/15'
                        : 'text-foreground'
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {style.label}
                  </Button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {POST_LENGTH.map((length) => {
                const isActive = selectedLength === length.label
                const Icon = length.icon
                return (
                  <Button
                    key={length.label}
                    type="button"
                    size="sm"
                    variant={isActive ? 'secondary' : 'outline'}
                    onClick={() => setSelectedLength(length.label)}
                    className={cn(
                      'gap-1.5 rounded-none',
                      isActive
                        ? 'bg-primary/10 text-primary hover:bg-primary/15'
                        : 'text-foreground'
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {length.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
