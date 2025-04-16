
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  showAnimation?: boolean;
  pulsateIndicator?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorColor, showAnimation = true, pulsateIndicator = false, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    if (showAnimation && value !== undefined) {
      // Animate the progress value with a slight delay for better visual effect
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value || 0);
    }
  }, [value, showAnimation]);
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-midnight-elevated border border-divider/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-700 ease-in-out progress-bar-fill",
          pulsateIndicator && "animate-pulse-subtle",
          indicatorColor || "bg-gradient-to-r from-arcane to-valor"
        )}
        style={{ transform: `translateX(-${100 - (displayValue || 0)}%)` }}
        asChild
      >
        <motion.div 
          initial={{ x: "0%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={pulsateIndicator ? "shadow-glow-subtle" : ""}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
