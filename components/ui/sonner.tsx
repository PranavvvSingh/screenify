"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "#FBF8F5",
          "--normal-border": "#C45C3B",
          "--normal-text": "#1A1A1A",
          "--success-bg": "#FBF8F5",
          "--success-border": "#C45C3B",
          "--success-text": "#1A1A1A",
          "--error-bg": "#FBF8F5",
          "--error-border": "#C45C3B",
          "--error-text": "#1A1A1A",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        className: "border-2 shadow-lg",
      }}
      icons={{
        success: <CheckCircle2 className="size-5 text-primary" />,
        loading: <Loader2 className="size-5 text-primary animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
