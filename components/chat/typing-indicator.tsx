"use client"

import { memo } from "react"

interface TypingIndicatorProps {
  label?: string
}

const TypingIndicatorComponent = ({ label = "typing" }: TypingIndicatorProps) => {
  const dots = [0, 1, 2]
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-foreground"
      aria-live="polite"
      aria-label={`${label} indicator`}
    >
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-1">
        {dots.map((dot) => (
          <span
            key={dot}
            className="block h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: `${dot * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export const TypingIndicator = memo(TypingIndicatorComponent)
TypingIndicator.displayName = "TypingIndicator"
