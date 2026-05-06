import * as React from 'react'
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  Loader2,
  Megaphone,
  PenTool,
  Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generatePostWithAnthropic } from '@/lib/generate-post'
import { cn } from '@/lib/utils'

const POST_STYLES = [
  { label: 'Professionale', icon: Briefcase },
  { label: 'Storytelling', icon: PenTool },
  { label: 'Tecnico', icon: Wrench },
  { label: 'Ispirazionale', icon: Lightbulb },
  { label: 'Educativo', icon: GraduationCap },
  { label: 'Promozionale', icon: Megaphone },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [selectedStyle, setSelectedStyle] = React.useState(POST_STYLES[0].label)
  const [prompt, setPrompt] = React.useState('')
  const [generating, setGenerating] = React.useState(false)

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
      <div className="flex-1 overflow-y-auto bg-background px-[40px] pb-10">
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
                <p className="text-xs text-muted-foreground">
                  Stile attivo: <span className="font-bold">{selectedStyle}</span>
                </p>
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
          </div>
        </div>
      </div>
    </>
  )
}
