import { useAuth } from '@/context/auth-context'
import { BookmarkCheck, CalendarDays, House } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  return (
    <header className={cn('px-[40px]', className)}>
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/Profile')}>
          <Avatar size="lg">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={`Avatar di ${username}`} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{username}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant={onHomePage ? 'secondary' : 'outline'}
            onClick={() => navigate('/home')}
            aria-label="Vai alla home"
            title="Home"
          >
            <House className="size-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={onCalendarPage ? 'secondary' : 'outline'}
            onClick={() => navigate('/calendar')}
            aria-label="Apri calendario"
            title="Calendario"
          >
            <CalendarDays className="size-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={onSavedPage ? 'secondary' : 'outline'}
            onClick={() => navigate('/saved')}
          >
            <BookmarkCheck className="size-3.5" aria-hidden />
            Saved
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
