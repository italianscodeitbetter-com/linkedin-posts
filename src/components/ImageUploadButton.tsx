import { useRef } from 'react'
import { ImageUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ImageUploadButtonProps = {
  onFileSelect: (file: File) => void
  label?: string
  accept?: string
  disabled?: boolean
  className?: string
}

export default function ImageUploadButton({
  onFileSelect,
  label = 'Carica immagine',
  accept = 'image/*',
  disabled = false,
  className,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="default"
        disabled={disabled}
        className={cn('gap-2', className)}
        onClick={handleClick}
      >
        <ImageUp />
        {label}
      </Button>
    </>
  )
}
