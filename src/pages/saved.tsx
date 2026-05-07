import * as React from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Copy, Download, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { listSavedDrafts, deleteDraft, type SavedDraft } from '@/lib/saved-drafts'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import DialogEditPost from '@/views/dialogEditPost'
import Loader from '@/components/loader'
import { useLinkedinStore } from '@/context/linkedinStore'
import { DownloadImageFromBucket, GetImageUrlFromBucket } from '@/lib/bucket'

export default function SavedDraftsPage() {
  const [drafts, setDrafts] = React.useState<SavedDraft[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [openDialogId, setOpenDialogId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)
  const { isLinkedinConnected } = useLinkedinStore()

  const loadDrafts = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await listSavedDrafts()
      setDrafts(items)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore nel caricamento'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadDrafts()
  }, [loadDrafts])



  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteDraft(id)
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast.success('Bozza eliminata')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore durante l\'eliminazione'
      toast.error(message)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Bozza copiata negli appunti')
    } catch {
      toast.error('Impossibile copiare la bozza')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background px-[40px] pb-10 pt-6">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bozze salvate
          </h1>
          <p className="text-sm text-muted-foreground">
            Tutti i post generati che hai deciso di salvare.
          </p>
        </div>

        {loading ? (
          <div className="rounded-none border bg-card p-6 text-sm text-muted-foreground">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-none border border-destructive/40 bg-card p-6 text-sm text-destructive">
            {error}
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-none border bg-card p-6 text-sm text-muted-foreground">
            Non hai ancora salvato bozze.
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <article key={draft.id} className="rounded-none border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-none border bg-muted px-2 py-1 text-xs font-medium">
                      {draft.post_name ?? draft.style}
                    </span>
                    <span className="rounded-none border bg-primary text-white px-2 py-1 text-xs font-medium">
                      {draft.style}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(draft.created_at), 'dd MMM yyyy, HH:mm', {
                        locale: it,
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCopy(draft.generated_text)}
                    >
                      <Copy className="size-3.5" aria-hidden />
                      Copia
                    </Button>
                    {draft.img_path && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void DownloadImageFromBucket(draft.img_path!).catch((e) =>
                          toast.error(e instanceof Error ? e.message : 'Errore nel download')
                        )}
                      >
                        <Download className="size-3.5" aria-hidden />
                        Scarica immagine
                      </Button>
                    )}


                    {/* <PublishLinkedInButton text={draft.generated_text} connected={isLinkedinConnected} /> */}

                    <Dialog
                      open={openDialogId === draft.id}
                      onOpenChange={(open) =>
                        setOpenDialogId(open ? draft.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="size-3.5" aria-hidden />
                          edit
                        </Button>
                      </DialogTrigger>
                      <DialogEditPost
                        draft={draft}
                        onSave={(updated) => {
                          setDrafts((prev) =>
                            prev.map((d) => (d.id === updated.id ? updated : d))
                          )
                          setOpenDialogId(null)
                        }}
                      />
                    </Dialog>

                    {confirmDeleteId === draft.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === draft.id}
                          onClick={() => void handleDelete(draft.id)}
                        >
                          {deletingId === draft.id ? 'Eliminazione...' : 'Conferma'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Annulla
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive  hover:text-destructive-foreground"
                        onClick={() => setConfirmDeleteId(draft.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Elimina
                      </Button>
                    )}


                  </div>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Prompt: {draft.prompt}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {draft.generated_text}
                </p>
                <div className="flex justify-center">
                  {draft.img_path && (
                    <img
                      src={GetImageUrlFromBucket(draft.img_path) ?? undefined}
                      alt="Immagine della bozza"
                      className="mt-3 max-w-[300px] h-auto rounded-none"
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
