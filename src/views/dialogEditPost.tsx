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

type DialogEditPostProps = {
  draft: SavedDraft
  onSave: (draft: SavedDraft) => void
}

export default function DialogEditPost({ draft, onSave }: DialogEditPostProps) {
  const [draftToEdit, setDraftToEdit] = useState<SavedDraft>(draft)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDraft(draftToEdit.id, {
        generated_text: draftToEdit.generated_text,
        scheduled_date: draftToEdit.scheduled_date ?? null,
        post_name: draftToEdit.post_name ?? null,
      })
      toast.success('Bozza aggiornata con successo')
      onSave(draftToEdit)
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
        <Textarea
          className="min-h-[180px] resize-none text-sm leading-relaxed"
          value={draftToEdit.generated_text}
          onChange={(e) =>
            setDraftToEdit({ ...draftToEdit, generated_text: e.target.value })
          }
        />
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
