import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { Separator } from '@/components/ui/separator'

function LinkedInGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-4"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.063 2.063 0 1.139-.925 2.065-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const {
    signInWithPassword,
    signInWithLinkedIn,
    supabaseReady,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = React.useState(false)
  const [oauthBusy, setOauthBusy] = React.useState(false)

  const redirectAfterLogin = React.useCallback(() => {
    const from = location.state?.from
    const redirectTo =
      typeof from === 'string' &&
      from.startsWith('/') &&
      !from.startsWith('//')
        ? from
        : '/'
    navigate(redirectTo, { replace: true })
  }, [location.state, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supabaseReady) {
      toast.error('Configura Supabase nel file .env')
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    if (!email || !password) return

    setSubmitting(true)
    const { error } = await signInWithPassword(email, password)
    setSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }
    redirectAfterLogin()
  }

  const handleLinkedIn = async () => {
    if (!supabaseReady) {
      toast.error('Configura Supabase nel file .env')
      return
    }
    setOauthBusy(true)
    const from = location.state?.from
    const nextPath =
      typeof from === 'string' &&
      from.startsWith('/') &&
      !from.startsWith('//')
        ? from
        : undefined
    const { error } = await signInWithLinkedIn({ nextPath })
    setOauthBusy(false)
    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <form
      {...props}
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Accedi</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Email e password oppure LinkedIn
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
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={!supabaseReady || oauthBusy || submitting}
            onClick={() => void handleLinkedIn()}
          >
            <LinkedInGlyph />
            {oauthBusy ? 'Reindirizzamento…' : 'Continua con LinkedIn'}
          </Button>
        </Field>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              oppure email
            </span>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            disabled={submitting || oauthBusy}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Password dimenticata?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={submitting || oauthBusy}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={!supabaseReady || submitting || oauthBusy}
          >
            {submitting ? 'Accesso…' : 'Accedi'}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Non hai un account?{' '}
            <Link to="/register" className="underline underline-offset-4">
              Registrati
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
