import * as React from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Copy, Download, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import DialogEditPost from '@/views/dialogEditPost'
import { type SavedDraft } from '@/lib/saved-drafts'
import { DownloadImageFromBucket, GetImageUrlFromBucket } from '@/lib/bucket'

interface SavedPostCardProps {
  draft: SavedDraft
  onDelete: (id: string) => Promise<void>
  onSave: (updated: SavedDraft) => void
}

export default function SavedPostCard({ draft, onDelete, onSave }: SavedPostCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(draft.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.generated_text)
      toast.success('Bozza copiata negli appunti')
    } catch {
      toast.error('Impossibile copiare la bozza')
    }
  }

  const handleDownload = async () => {
    if (!draft.img_path) return
    try {
      await DownloadImageFromBucket(draft.img_path)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore nel download')
    }
  }

  return (
    <article className="rounded-none border bg-card p-4">
      {/* Header: tags + date */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-none border bg-muted px-2 py-1 text-xs font-medium">
          {draft.post_name ?? draft.style}
        </span>
        <span className="rounded-none border bg-primary text-primary-foreground px-2 py-1 text-xs font-medium">
          {draft.style}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {format(new Date(draft.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
        </span>
      </div>

      {/* Prompt */}
      <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
        <span className="font-medium">Prompt:</span> {draft.prompt}
      </p>

      {/* Body text */}
      <p className="whitespace-pre-wrap text-sm text-foreground">
        {draft.generated_text}
      </p>

      {/* Image */}
      {draft.img_path && (
        <div className="mt-3 flex justify-center">
          <img
            src={GetImageUrlFromBucket(draft.img_path) ?? undefined}
            alt="Immagine della bozza"
            className="max-w-[300px] w-full h-auto rounded-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => void handleCopy()}
        >
          <Copy className="size-3.5" aria-hidden />
          <span>Copia</span>
        </Button>

        {draft.img_path && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => void handleDownload()}
          >
            <Download className="size-3.5" aria-hidden />
            <span className="hidden xs:inline">Scarica immagine</span>
            <span className="xs:hidden">Scarica</span>
          </Button>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Edit2 className="size-3.5" aria-hidden />
              <span>Modifica</span>
            </Button>
          </DialogTrigger>
          <DialogEditPost
            draft={draft}
            onSave={(updated) => {
              onSave(updated)
              setDialogOpen(false)
            }}
          />
        </Dialog>

        {confirmDelete ? (
          <div className="flex flex-1 sm:flex-none items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="flex-1 sm:flex-none"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Eliminazione...' : 'Conferma'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Annulla
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none text-destructive hover:text-destructive-foreground"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            <span>Elimina</span>
          </Button>
        )}
      </div>
    </article>
  )
}
