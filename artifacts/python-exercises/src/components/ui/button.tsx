import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md shadow-secondary/20",
      outline: "border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary",
      ghost: "hover:bg-muted text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20",
      success: "bg-success text-success-foreground hover:bg-success/90 shadow-md shadow-success/20",
    }

    const sizes = {
      default: "h-12 px-6 py-2 rounded-xl text-base",
      sm: "h-10 px-4 rounded-lg text-sm",
      lg: "h-14 px-8 rounded-2xl text-lg font-bold",
      icon: "h-12 w-12 rounded-xl",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-display font-semibold transition-all duration-200 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
