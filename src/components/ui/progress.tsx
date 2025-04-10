
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  showAnimation?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorColor, showAnimation = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/5",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300",
        indicatorColor ? indicatorColor : "bg-arcane-purple-60",
        showAnimation && value && value > 0 ? "animate-shimmer" : ""
      )}
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundSize: showAnimation ? "200% 100%" : "100% 100%",
        boxShadow: showAnimation ? "var(--glow-purple)" : "none"
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
