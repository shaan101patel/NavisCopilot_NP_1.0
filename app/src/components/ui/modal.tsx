import * as React from "react"
import { cn } from "@/lib/utils"

interface ModalContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined)

function useModal() {
  const context = React.useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a Modal")
  }
  return context
}

interface ModalProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Modal({ children, open, onOpenChange }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }
  }, [open, onOpenChange])

  return (
    <ModalContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </ModalContext.Provider>
  )
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ModalContent({ children, className, ...props }: ModalContentProps) {
  const { open, setOpen } = useModal()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />
      
      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto",
          "bg-background rounded-lg border shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ModalHeader({ children, className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

function ModalDescription({ children, className, ...props }: ModalDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ModalBody({ children, className, ...props }: ModalBodyProps) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ModalFooter({ children, className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-3 p-6 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
}
