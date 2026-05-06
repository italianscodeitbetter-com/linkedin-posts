import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { signUp, supabaseReady } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supabaseReady) {
      toast.error('Configura Supabase nel file .env')
      return
    }
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const confirm = String(fd.get('password_confirm') ?? '')
    if (!name || !email || !password || password !== confirm) return

    setSubmitting(true)
    const { error, needsEmailConfirmation } = await signUp({
      email,
      password,
      name,
    })
    setSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (needsEmailConfirmation) {
      toast.success(
        'Controlla la posta e conferma l’email per completare la registrazione.'
      )
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <form
      {...props}
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea un account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Registrazione con email e password (Supabase Auth)
          </p>
        </div>

        {!supabaseReady ? (
          <FieldDescription className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-950 dark:text-amber-100">
            Aggiungi <code className="text-xs">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> nel
            file <code className="text-xs">.env</code>.
          </FieldDescription>
        ) : null}

        <Field>
          <FieldLabel htmlFor="register-name">Nome</FieldLabel>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={submitting}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            disabled={submitting}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            disabled={submitting}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="register-password-confirm">
            Conferma password
          </FieldLabel>
          <Input
            id="register-password-confirm"
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            disabled={submitting}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={!supabaseReady || submitting}>
            {submitting ? 'Invio…' : 'Registrati'}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Hai già un account?{' '}
            <Link to="/login" className="underline underline-offset-4">
              Accedi
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
