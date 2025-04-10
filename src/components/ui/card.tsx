
import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// Define a type that combines HTMLDivElement props with additional interactive prop
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    // When not interactive, just render a regular div
    if (!interactive) {
      return (
        <div
          ref={ref}
          className={cn(
            "bg-midnight-card border border-divider/30 rounded-xl shadow-subtle transition-all duration-300",
            className
          )}
          {...props}
        />
      );
    }
    
    // When interactive, use motion.div with properly typed props
    // We need to explicitly type the motion props to avoid type errors
    const motionProps = props as unknown as HTMLMotionProps<"div">;
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-midnight-card border border-divider/30 rounded-xl shadow-subtle transition-all duration-300",
          "hover:shadow-elevated hover:-translate-y-1 hover:border-arcane-30/50",
          className
        )}
        whileHover={{ 
          y: -4, 
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)" 
        }}
        {...motionProps}
      />
    );
  }
);
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl orbitron-text font-semibold leading-none text-text-primary tracking-wide",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-sora text-text-secondary leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
