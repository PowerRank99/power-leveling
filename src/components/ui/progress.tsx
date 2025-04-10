
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
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700/30",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300",
        indicatorColor ? indicatorColor : "bg-arcane",
        showAnimation && value && value > 0 ? "animate-shimmer bg-[length:200%_100%]" : ""
      )}
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundSize: showAnimation ? "200% 100%" : "100% 100%",
        boxShadow: showAnimation ? "0 0 10px rgba(124, 58, 237, 0.3)" : "none"
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
