import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-gradient-to-r from-electric-violet to-app-blue text-white hover:from-electric-violet/90 hover:to-app-blue/90 shadow-lg shadow-electric-violet/30",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-electric-violet/30 bg-transparent text-white hover:bg-electric-violet/10 hover:border-electric-violet/50",
      secondary: "bg-manatee/20 text-manatee hover:bg-manatee/30",
      ghost: "text-manatee hover:bg-electric-violet/10 hover:text-white",
      link: "text-electric-violet underline-offset-4 hover:underline",
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
