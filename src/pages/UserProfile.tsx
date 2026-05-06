import * as React from 'react'
import { Building2, Loader2, Save, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { getUserProfile, upsertUserProfile } from '@/lib/user-profile'

export default function UserProfile() {
  const { user } = useAuth()

  const [company, setCompany] = React.useState('')
  const [role, setRole] = React.useState('')
  const [roleDescription, setRoleDescription] = React.useState('')
  const [companyDescription, setCompanyDescription] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const profile = await getUserProfile()
        if (profile) {
          setCompany(profile.company ?? '')
          setRole(profile.role ?? '')
          setRoleDescription(profile.role_description ?? '')
          setCompanyDescription(profile.company_description ?? '')
        }
      } catch {
        // profilo non ancora esistente — campi vuoti
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertUserProfile({ company, role, roleDescription, companyDescription })
      toast.success('Profilo aggiornato')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Errore nel salvataggio'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex-1 overflow-y-auto bg-background px-[40px] pb-10 pt-6">
      <div className="mx-auto w-full max-w-2xl space-y-8">

        {/* Page title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profilo</h1>
          <p className="text-sm text-muted-foreground">
            Le tue informazioni personali e professionali.
          </p>
        </div>

        {/* Avatar + info account */}
        <div className="flex items-center gap-5 rounded-none border bg-card p-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? 'Avatar'}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {user?.name ? (
              <p className="truncate text-base font-semibold">{user.name}</p>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserCircle2 className="size-4 shrink-0" aria-hidden />
                <span>Nome non disponibile</span>
              </div>
            )}
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Professional info */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Informazioni professionali
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Caricamento profilo…
            </div>
          ) : (
            <div className="space-y-4 rounded-none border bg-card p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="company"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Azienda
                  </label>
                  <Input
                    id="company"
                    placeholder="Es. Acme S.r.l."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="rounded-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Ruolo
                  </label>
                  <Input
                    id="role"
                    placeholder="Es. Head of Marketing"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="role-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Descrizione del ruolo
                </label>
                <Textarea
                  id="role-description"
                  placeholder="Descrivi brevemente le tue responsabilità e il valore che porti…"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="min-h-[120px] resize-none rounded-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="company-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Descrizione dell'azienda
                </label>
                <Textarea
                  id="company-description"
                  placeholder="Descrivi brevemente il business, il settore e i clienti target dell'azienda…"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="min-h-[120px] resize-none rounded-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Salvataggio…
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" aria-hidden />
                      Salva modifiche
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
