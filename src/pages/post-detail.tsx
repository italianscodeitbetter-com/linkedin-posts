import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookmarkCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { saveDraft } from '@/lib/saved-drafts'
import { DatePicker } from '@/components/ui/date-picker'
import { useLinkedinStore } from '@/context/linkedinStore'
import ImageUploaderView from '@/views/imageUploaderView'
import { UploadImageToBucket } from '@/lib/bucket'

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
  const [postName, setPostName] = React.useState('')
  const [scheduledDate, setScheduledDate] = React.useState<string | undefined>(undefined)
  const [saving, setSaving] = React.useState(false)
  const [img, setImg] = React.useState<File | null>(null)
  const { isLinkedinConnected } = useLinkedinStore()

  React.useEffect(() => {
    if (!state?.generatedText) {
      navigate('/home', { replace: true })
    }
  }, [state, navigate])

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)

    if (img) {
      await UploadImageToBucket(img)
    }
    try {
      await saveDraft({
        prompt: state?.prompt ?? '',
        style: state?.style ?? '',
        generatedText: text,
        isPublished: false,
        postName: postName.trim() || undefined,
        scheduled_date: scheduledDate ?? undefined,
        img_path: img?.name ?? undefined,
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
    <div className="flex-1 overflow-y-auto bg-background px-[40px] pb-10 pt-6">
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-name" className="text-xs font-medium text-muted-foreground">
            Nome del post
          </label>
          <Input
            id="post-name"
            placeholder="Es. Lancio evento AI – maggio 2026"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
            className="rounded-none"

          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-name" className="text-xs font-medium text-muted-foreground">
            Quando vuoi programmare il post?
          </label>
          <DatePicker
            value={
              scheduledDate
                ? new Date(scheduledDate)
                : undefined
            }
            onChange={(date) =>
              setScheduledDate(
                date?.toISOString() ?? undefined)
            }
          />
        </div>
        <ImageUploaderView imageToUpload={(file) => { setImg(file) }} />

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
                disabled={saving || !postName && postName.length > 0}
              >
                <BookmarkCheck className="size-3.5" aria-hidden />
                {saving ? 'Salvataggio...' : 'Salva bozza'}
              </Button>
              {/* <PublishLinkedInButton text={text} disabled={!text.trim()} connected={isLinkedinConnected} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
