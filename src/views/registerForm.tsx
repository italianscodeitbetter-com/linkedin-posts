import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const confirm = String(fd.get('password_confirm') ?? '')
    if (!name || !email || !password || password !== confirm) return

    login({ email, name })
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
            Inserisci i dati qui sotto per registrarti
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="register-name">Nome</FieldLabel>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
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
          />
        </Field>
        <Field>
          <Button type="submit">Registrati</Button>
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
