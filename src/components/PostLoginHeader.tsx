import { useAuth } from '@/context/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PostLoginHeaderProps = {
  className?: string
}

export function PostLoginHeader({ className }: PostLoginHeaderProps) {
  const { user, logout } = useAuth()
  const username = user?.name?.trim() || user?.email?.split('@')[0] || 'Utente'
  const initials = username.slice(0, 1).toUpperCase()

  return (
    <header className={cn('px-[40px]', className)}>
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
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
        <Button type="button" variant="destructive" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
