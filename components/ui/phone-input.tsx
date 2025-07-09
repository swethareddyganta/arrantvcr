"use client"

import React from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export function PhoneInputField({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
  error,
  disabled
}: PhoneInputProps) {
  return (
    <div className="relative">
      <PhoneInput
        international
        defaultCountry="US"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "PhoneInput",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        disabled={disabled}
      />
    </div>
  )
} 