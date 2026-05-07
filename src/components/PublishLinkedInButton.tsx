import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  connectLinkedIn,
  publishToLinkedIn,
} from '@/lib/linkedin'

type Props = {
  text: string
  disabled?: boolean
  size?: React.ComponentProps<typeof Button>['size']
  variant?: React.ComponentProps<typeof Button>['variant']
  connected?: boolean
}

export function PublishLinkedInButton({
  text,
  disabled,
  size = 'sm',
  variant,
  connected = false
}: Props) {

  const [publishing, setPublishing] = React.useState(false)


  const handleClick = async () => {
    if (!connected) {
      connectLinkedIn()
      return
    }

    setPublishing(true)
    try {
      await publishToLinkedIn(text)
      toast.success('Post pubblicato su LinkedIn!')
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Errore durante la pubblicazione'
      toast.error(message)
    } finally {
      setPublishing(false)
    }
  }

  const label =
    connected === null
      ? 'LinkedIn…'
      : connected
        ? publishing
          ? 'Pubblicazione…'
          : 'Pubblica su LinkedIn'
        : 'Connetti LinkedIn'

  return (
    <Button
      type="button"
      size={size}
      variant={variant ?? (connected ? 'default' : 'outline')}
      disabled={disabled || publishing || connected === null || !text.trim()}
      onClick={() => void handleClick()}
    >
      {publishing && (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      )}
      {label}
    </Button>
  )
}
