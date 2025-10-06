"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { clsx } from "clsx"

// Select context
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

// Select root component
interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// Select trigger component
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}

export function SelectTrigger({ 
  children, 
  className, 
  "aria-label": ariaLabel,
  ...props 
}: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-label={ariaLabel}
      className={clsx(
        "neu-button flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm",
        "hover:shadow-neu-button-hover focus:outline-none focus:ring-2 focus:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

// Select value component
interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext()
  
  return (
    <span className={clsx(
      value ? "text-foreground" : "text-muted-foreground"
    )}>
      {value || placeholder}
    </span>
  )
}

// Select content component
interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      className={clsx(
        "neu-raised absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border",
        "bg-card text-card-foreground shadow-md",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

// Select item component
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
  className?: string
}

export function SelectItem({ 
  value, 
  children, 
  className,
  ...props 
}: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext()

  const handleClick = () => {
    onValueChange(value)
    setOpen(false)
  }

  return (
    <div
      className={clsx(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === value && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}
