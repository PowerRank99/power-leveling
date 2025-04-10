
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        arcane: "border-arcane-30 bg-arcane-15 text-arcane hover:bg-arcane-30 shadow-glow-subtle animate-pulse-subtle",
        valor: "border-valor-30 bg-valor-15 text-valor hover:bg-valor-30 shadow-glow-subtle animate-pulse-subtle",
        achievement: "border-achievement-30 bg-achievement-15 text-achievement hover:bg-achievement-30 shadow-glow-gold animate-pulse-subtle",
        guild: "border-arcane-30 bg-midnight-elevated text-text-secondary hover:bg-arcane-15 shadow-glow-subtle",
        master: "border-achievement-30 bg-achievement-15 text-achievement border border-achievement-30 shadow-glow-gold animate-pulse-subtle font-space",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
