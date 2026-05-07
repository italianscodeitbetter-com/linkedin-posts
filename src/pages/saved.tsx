import * as React from 'react'
import { toast } from 'sonner'

import { listSavedDrafts, deleteDraft, type SavedDraft } from '@/lib/saved-drafts'
import Loader from '@/components/loader'
import { Input } from '@/components/ui/input'
import SavedPostCard from '@/components/SavedPostCard'

export default function SavedDraftsPage() {
  const [drafts, setDrafts] = React.useState<SavedDraft[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchString, setSearchString] = React.useState<string>('')


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
    try {
      await deleteDraft(id)
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast.success('Bozza eliminata')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore durante l\'eliminazione'
      toast.error(message)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background px-4 sm:px-10 pb-10 pt-6">
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
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="post"
                className="text-s font-medium text-muted-foreground"
              >
                Cerca la bozza del post
              </label>
              <Input
                id="company"
                placeholder="Es. Acme S.r.l."
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="rounded-none"
              />
            </div>
            {drafts
              .filter((draft) =>
                draft.post_name?.toLowerCase().includes(searchString.toLowerCase())
              )
              .map((draft) => (
                <SavedPostCard
                  key={draft.id}
                  draft={draft}
                  onDelete={handleDelete}
                  onSave={(updated) =>
                    setDrafts((prev) =>
                      prev.map((d) => (d.id === updated.id ? updated : d))
                    )
                  }
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
