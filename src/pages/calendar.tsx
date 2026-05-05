import * as React from 'react'

import { Calendar } from '@/components/ui/calendar'

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="h-[calc(100svh-120px)] overflow-hidden bg-background px-[40px] pb-4 pt-4">
      <div className="flex h-full w-full flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Vista in stile Apple per pianificare i contenuti LinkedIn.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="h-full [--cell-size:2rem]"
            classNames={{
              months: 'items-start',
              month: 'w-auto',
              table: 'w-auto border-collapse',
              weekdays: 'w-auto',
              week: 'mt-2 w-auto',
              day_button:
                '!size-8 !min-w-8 !items-start !justify-start !px-1.5 !py-1 text-[11px] font-medium',
            }}
          />
        </div>
      </div>
    </div>
  )
}
