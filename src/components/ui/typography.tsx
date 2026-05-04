import * as React from "react"

import { cn } from "@/lib/utils"

/** @see https://ui.shadcn.com/docs/components/typography */
function TypographyH1({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-balance text-4xl font-extrabold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

/** Lead paragraph — subtitle / intro copy */
function TypographyLead({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props} />
  )
}

const Typography = {
  H1: TypographyH1,
  Lead: TypographyLead,
}

export { Typography, TypographyH1, TypographyLead }
