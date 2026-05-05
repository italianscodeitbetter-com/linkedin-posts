import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookmarkCheck, CalendarClock, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveDraft } from '@/lib/saved-drafts'

type PostDetailState = {
  generatedText: string
  style: string
  prompt: string
}

export default function PostDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as PostDetailState | null
  const [text, setText] = React.useState(state?.generatedText ?? '')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!state?.generatedText) {
      navigate('/home', { replace: true })
    }
  }, [state, navigate])

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await saveDraft({
        prompt: state?.prompt ?? '',
        style: state?.style ?? '',
        generatedText: text,
      })
      toast.success('Bozza salvata')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Errore nel salvataggio'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100svh-120px)] bg-background px-[40px] pb-10 pt-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => navigate('/home')}
            aria-label="Torna alla home"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Il tuo post
            </h1>
            {state?.style ? (
              <p className="text-xs text-muted-foreground">
                Stile: <span className="font-medium">{state.style}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-none border bg-card shadow-sm">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Il post generato apparirà qui..."
            className="min-h-[400px] resize-none rounded-none border-0 bg-transparent p-4 text-sm leading-relaxed focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {text.length} caratteri
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleSave()}
                disabled={saving || !text.trim()}
              >
                <BookmarkCheck className="size-3.5" aria-hidden />
                {saving ? 'Salvataggio...' : 'Salva bozza'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate('/calendar')}
                disabled={!text.trim()}
              >
                <CalendarClock className="size-3.5" aria-hidden />
                Programma post
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!text.trim()}
              >
                <Send className="size-3.5" aria-hidden />
                Crea post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
