import { useAuth } from '@/context/auth-context'
import { BookmarkCheck, CalendarDays, House } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'
import { getUserProfile } from '@/lib/user-profile'
import { useUserStore } from '@/context/userProfileStore'

type HeaderProps = {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const username = user?.name?.trim() || user?.email?.split('@')[0] || 'Utente'
  const initials = username.slice(0, 1).toUpperCase()
  const onHomePage = location.pathname === '/home'
  const onCalendarPage = location.pathname === '/calendar'
  const onSavedPage = location.pathname === '/saved'
  const { setUser } = useUserStore()

  React.useEffect(() => {
    void (async () => {
      try {
        const profile = await getUserProfile()
        setUser(profile)
      } catch {
        // profilo non ancora esistente — campi vuoti
      }
    })()
  }, [])

  return (
    <header className={cn('px-4 sm:px-10', className)}>
      <div className="flex items-center justify-between gap-3 pb-4">
        <div
          className="flex min-w-0 items-center gap-3 cursor-pointer"
          onClick={() => navigate('/Profile')}
        >
          <Avatar size="lg" className="shrink-0">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={`Avatar di ${username}`} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            size="sm"
            variant={onHomePage ? 'secondary' : 'outline'}
            onClick={() => navigate('/home')}
            aria-label="Vai alla home"
            title="Home"
          >
            <House className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={onCalendarPage ? 'secondary' : 'outline'}
            onClick={() => navigate('/calendar')}
            aria-label="Apri calendario"
            title="Calendario"
          >
            <CalendarDays className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Calendario</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={onSavedPage ? 'secondary' : 'outline'}
            onClick={() => navigate('/saved')}
            aria-label="Bozze salvate"
            title="Saved"
          >
            <BookmarkCheck className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Saved</span>
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={logout}>
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Esci</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}


