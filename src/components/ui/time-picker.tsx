import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const timePickerInputClassName =
  "appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"

type TimePickerProps = Omit<React.ComponentProps<typeof Input>, "type">

function TimePicker({ className, ...props }: TimePickerProps) {
  return (
    <Input
      type="time"
      className={cn(timePickerInputClassName, className)}
      {...props}
    />
  )
}

export { TimePicker, type TimePickerProps }
