import * as React from 'react'
import {
  Briefcase,
  Copy,
  GraduationCap,
  Lightbulb,
  Megaphone,
  PenTool,
  Wrench,
} from 'lucide-react'
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
  const [selectedStyle, setSelectedStyle] = React.useState(POST_STYLES[0].label)
  const [prompt, setPrompt] = React.useState('')
  const [generatedPost, setGeneratedPost] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [generationError, setGenerationError] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt.length < 10) {
      toast.error('Inserisci almeno 10 caratteri per generare il post')
      return
    }
    setGenerating(true)
    setGenerationError(null)
    try {
      const text = await generatePostWithAnthropic({
        prompt: trimmedPrompt,
        style: selectedStyle,
      })
      setGeneratedPost(text)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Errore durante la generazione'
      setGenerationError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedPost) return
    try {
      await navigator.clipboard.writeText(generatedPost)
      toast.success('Post copiato negli appunti')
    } catch {
      toast.error('Impossibile copiare il contenuto')
    }
  }

  return (
    <div className="min-h-[calc(100svh-120px)] bg-background px-[40px] pb-10">
      <div className="mx-auto flex min-h-[calc(100svh-200px)] w-full max-w-4xl items-center justify-center">
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

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight">
                Bozza generata
              </h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleCopy()}
                disabled={!generatedPost}
              >
                <Copy className="size-3.5" aria-hidden />
                Copia
              </Button>
            </div>
            <div className="min-h-40 rounded-xl border bg-background p-3">
              {generationError ? (
                <p className="text-sm text-destructive">{generationError}</p>
              ) : generatedPost ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {generatedPost}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  La bozza apparira qui dopo la generazione.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
