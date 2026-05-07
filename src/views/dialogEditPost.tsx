import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { type SavedDraft, updateDraft } from '@/lib/saved-drafts'
import { Checkbox } from '@/components/ui/checkbox'
import { DeleteImageUrlFromBucket, UploadImageToBucket } from '@/lib/bucket'
import ImageUploaderView from './imageUploaderView'

type DialogEditPostProps = {
  draft: SavedDraft
  onSave: (draft: SavedDraft) => void
}

export default function DialogEditPost({ draft, onSave }: DialogEditPostProps) {
  const [draftToEdit, setDraftToEdit] = useState<SavedDraft>(draft)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      let img_path = draftToEdit.img_path ?? null
      if (pendingImage) {
        await UploadImageToBucket(pendingImage)
        img_path = pendingImage.name
      }

      const updated: SavedDraft = { ...draftToEdit, img_path: img_path ?? undefined }
      await DeleteImageUrlFromBucket(draftToEdit.img_path ?? '')
      await updateDraft(updated.id, {
        generated_text: updated.generated_text,
        scheduled_date: updated.scheduled_date ?? null,
        post_name: updated.post_name ?? null,
        isPublished: updated.isPublished ?? false,
        img_path,
      })

      toast.success('Bozza aggiornata con successo')
      onSave(updated)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore nel salvataggio'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-2xl">
      <DialogHeader className="shrink-0">
        <DialogTitle>Modifica Draft</DialogTitle>
        <DialogDescription>Modifica il testo e la data di pubblicazione.</DialogDescription>
      </DialogHeader>

      <div className="grid flex-1 gap-4 overflow-y-auto py-4 pr-1">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Nome post</p>
          <Input
            placeholder="Es. Lancio evento AI – maggio 2026"
            value={draftToEdit.post_name ?? ''}
            onChange={(e) =>
              setDraftToEdit({ ...draftToEdit, post_name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <ImageUploaderView img_path={draftToEdit.img_path} imageToUpload={(file) => setPendingImage(file)} />
        </div>

        <Textarea
          className="min-h-[180px] resize-none text-sm leading-relaxed"
          value={draftToEdit.generated_text}
          onChange={(e) =>
            setDraftToEdit({ ...draftToEdit, generated_text: e.target.value })
          }
        />
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Programma pubblicazione
            </p>
            <DatePicker
              value={
                draftToEdit.scheduled_date
                  ? new Date(draftToEdit.scheduled_date)
                  : undefined
              }
              onChange={(date) =>
                setDraftToEdit({
                  ...draftToEdit,
                  scheduled_date: date?.toISOString(),
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Il post è pubblicato?
            </p>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={draftToEdit.isPublished ?? false}
                onCheckedChange={(checked) =>
                  setDraftToEdit({ ...draftToEdit, isPublished: checked as boolean })
                }
              />
              <p className="text-xs font-medium text-muted-foreground">
                Pubblicato
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="shrink-0">
        <DialogClose asChild>
          <Button variant="outline" disabled={saving}>
            Chiudi
          </Button>
        </DialogClose>
        <Button variant="default" disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Salvataggio…' : 'Salva'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}


