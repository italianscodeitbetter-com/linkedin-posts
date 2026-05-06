import * as React from 'react'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { PublishLinkedInButton } from '@/components/PublishLinkedInButton'
import { listSavedDrafts, type SavedDraft } from '@/lib/saved-drafts'

const EVENT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
]

function hashColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]
}

type ScheduledDraft = SavedDraft & { scheduled_date: string }

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date())
  const [drafts, setDrafts] = React.useState<ScheduledDraft[]>([])
  const [loading, setLoading] = React.useState(true)
  const [detailPost, setDetailPost] = React.useState<ScheduledDraft | null>(null)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Post copiato negli appunti')
    } catch {
      toast.error('Impossibile copiare il post')
    }
  }

  React.useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const all = await listSavedDrafts()
        setDrafts(
          all.filter((d): d is ScheduledDraft => Boolean(d.scheduled_date))
        )
      } catch {
        // silently fail — calendar still works without events
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const eventsForDay = (day: Date) =>
    drafts.filter((d) => isSameDay(parseISO(d.scheduled_date), day))

  const selectedDayEvents = selectedDate ? eventsForDay(selectedDate) : []

  const weekDayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            {format(currentMonth, 'MMMM yyyy', { locale: it })
              .replace(/^\w/, (c) => c.toUpperCase())}
          </h1>
          {loading && (
            <span className="text-xs text-muted-foreground">Caricamento eventi…</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setCurrentMonth(new Date())}
          >
            Oggi
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Calendar grid */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDayLabels.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex min-h-0 flex-1 flex-col">
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="grid min-h-0 flex-1 grid-cols-7"
                style={{ borderBottom: wi < weeks.length - 1 ? '1px solid hsl(var(--border))' : undefined }}
              >
                {week.map((day) => {
                  const dayEvents = eventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                  const isTodayDay = isToday(day)

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={[
                        'group flex h-full min-h-0 flex-col gap-1 overflow-hidden border-r p-1.5 text-left transition-colors last:border-r-0',
                        isCurrentMonth
                          ? 'bg-background hover:bg-muted/40'
                          : 'bg-muted/20 hover:bg-muted/30',
                        isSelected ? 'ring-1 ring-inset ring-primary/40' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {/* Day number */}
                      <span
                        className={[
                          'inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-medium',
                          isTodayDay
                            ? 'bg-primary text-primary-foreground'
                            : isCurrentMonth
                              ? 'text-foreground'
                              : 'text-muted-foreground/50',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Events */}
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className={[
                              'truncate rounded-sm px-1 py-0.5 text-[10px] font-medium leading-tight text-white',
                              hashColor(ev.style),
                            ].join(' ')}
                          >
                            {ev.post_name ?? ev.style}
                          </span>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="px-1 text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3} altri
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar – selected day detail */}
        {selectedDate && (
          <div className="flex w-72 shrink-0 flex-col border-l">
            <div className="border-b px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {format(selectedDate, 'EEEE', { locale: it })
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </p>
              <p className="text-2xl font-semibold">
                {format(selectedDate, 'd MMMM yyyy', { locale: it })}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {selectedDayEvents.length === 0 ? (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Nessun post pianificato
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setDetailPost(ev)}
                      className="w-full rounded-none border bg-card p-3 text-left text-xs transition-colors hover:bg-muted/40"
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <span
                          className={[
                            'inline-block size-2 shrink-0 rounded-full',
                            hashColor(ev.style),
                          ].join(' ')}
                        />
                        <span className="font-medium">{ev.style}</span>
                      </div>
                      <p className="line-clamp-3 text-muted-foreground">
                        {ev.generated_text}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post detail dialog */}
      <Dialog open={Boolean(detailPost)} onOpenChange={(open) => { if (!open) setDetailPost(null) }}>
        {detailPost && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span
                  className={[
                    'inline-block size-2.5 shrink-0 rounded-full',
                    hashColor(detailPost.style),
                  ].join(' ')}
                />
                {detailPost.style}
              </DialogTitle>
              <DialogDescription>
                {format(parseISO(detailPost.scheduled_date), "d MMMM yyyy", { locale: it })}
                {detailPost.prompt ? ` · ${detailPost.prompt}` : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[55vh] overflow-y-auto rounded-none border bg-muted/30 px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {detailPost.generated_text}
              </p>
            </div>

            <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCopy(detailPost.generated_text)}
                >
                  <Copy className="size-3.5" aria-hidden />
                  Copia
                </Button>
                <PublishLinkedInButton text={detailPost.generated_text} size="sm" />
              </div>
              <DialogClose asChild>
                <Button type="button" size="sm" variant="ghost">
                  Chiudi
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
