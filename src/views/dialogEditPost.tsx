import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
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
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Modifica Draft</DialogTitle>
        <DialogDescription>Modifica il testo e la data di pubblicazione.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <Textarea
          className="min-h-[260px] resize-none text-sm leading-relaxed"
          value={draftToEdit.generated_text}
          onChange={(e) =>
            setDraftToEdit({ ...draftToEdit, generated_text: e.target.value })
          }
        />
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

      <DialogFooter>
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
