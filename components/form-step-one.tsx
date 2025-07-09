"use client"

import type React from "react"
import type { FC } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { PhoneInputField } from "@/components/ui/phone-input"
import { LocationSelector } from "@/components/ui/location-selector"
import { isValidEmail, isValidPhoneNumber } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import type { FormData } from "@/app/page"

interface Props {
  formData: FormData
  updateFormData: (field: keyof FormData, value: any) => void
  onNext: () => void
}

const FormSection: FC<{ title: string; children: React.ReactNode; stepNumber: number }> = ({
  title,
  children,
  stepNumber,
}) => (
  <div className="border-b border-gray-200/80 p-6 sm:p-8">
    <h3 className="mb-6 text-lg font-semibold text-gray-800">
      <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {stepNumber}
      </span>
      {title}
    </h3>
    <div className="pl-10">{children}</div>
  </div>
)

export const FormStepOne: FC<Props> = ({ formData, updateFormData, onNext }) => {
  const { toast } = useToast()

  const handleNext = () => {
    const errors: string[] = []

    // Validate required fields with specific messages
    if (!formData.customerName?.trim()) {
      errors.push("Customer Name")
    }

    if (!formData.customerAddress?.trim()) {
      errors.push("Customer Address")
    }

    if (!formData.branchName?.trim()) {
      errors.push("Unit / Branch Name")
    }

    if (!formData.projectName?.trim()) {
      errors.push("Project / Product Name")
    }

    if (!formData.location?.trim()) {
      errors.push("Location Selection")
    }

    // Show all validation errors at once
    if (errors.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following required fields: ${errors.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email Address",
        description: `"${formData.email}" is not a valid email address. Please check the format and try again.`,
        variant: "destructive",
      })
      return
    }

    // Validate phone if provided
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: `"${formData.phone}" is not a valid phone number. Please include country code if needed.`,
        variant: "destructive",
      })
      return
    }

    // Success message
    toast({
      title: "Step 1 Completed",
      description: "All required fields are filled. Proceeding to Step 2...",
    })

    onNext()
  }

  return (
    <div>
      <FormSection title="Customer Details" stepNumber={1}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => updateFormData("customerName", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Customer Address *</Label>
            <Input
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => updateFormData("customerAddress", e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Project Information" stepNumber={2}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <div>
            <Label htmlFor="branchName">Unit / Branch Name or Place *</Label>
            <Input
              id="branchName"
              value={formData.branchName}
              onChange={(e) => updateFormData("branchName", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="projectName">Project / Product / Block Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => updateFormData("projectName", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div className="md:col-span-2">
            <LocationSelector
              value={formData.locationData}
              onChange={(location) => {
                updateFormData("locationData", location)
                if (location) {
                  updateFormData("location", location.address || `${location.lat}, ${location.lng}`)
                } else {
                  updateFormData("location", "")
                }
              }}
              placeholder="Search for address, city, or landmark..."
              label="Location Selection *"
            />
          </div>
          <div>
            <Label htmlFor="uniqueId">Unique ID (Auto-Generated)</Label>
            <Input id="uniqueId" value={formData.uniqueId} disabled className="mt-1" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact & Other Details" stepNumber={3}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInputField
              value={formData.phone}
              onChange={(value) => updateFormData("phone", value || "")}
              className="mt-1"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="email">Email ID</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="otherInfo">Others (Any)</Label>
            <Textarea
              id="otherInfo"
              value={formData.otherInfo}
              onChange={(e) => updateFormData("otherInfo", e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end bg-gray-50 px-6 py-4">
        <Button onClick={handleNext} size="lg" className="rounded-full">
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
