"use client"

import type React from "react"
import { useMemo } from "react"
import type { FC } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import type { FormData, PressureDropItem } from "@/app/page"
import { standardsData, filterOptions, ahuSpecOptions } from "@/lib/standards-data"

interface Props {
  formData: FormData
  updateFormData: (field: keyof FormData, value: any) => void
  onBack: () => void
}

const FormSection: FC<{ title: string; children: React.ReactNode; stepNumber?: number }> = ({
  title,
  children,
  stepNumber,
}) => (
  <div className="border-b border-gray-200/80 p-6 sm:p-8">
    <h3 className="mb-6 text-lg font-semibold text-gray-800">
      {stepNumber && (
        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {stepNumber}
        </span>
      )}
      {title}
    </h3>
    <div className={stepNumber ? "pl-10" : ""}>{children}</div>
  </div>
)

export const FormStepTwo: FC<Props> = ({ formData, updateFormData, onBack }) => {
  const router = useRouter()
  
  const classificationOptions = useMemo(() => {
    return standardsData.rows.map((row) => row[formData.standard]).filter(Boolean) as string[]
  }, [formData.standard])

  const handleStandardChange = (value: string) => {
    const standardKey = value as keyof typeof standardsData.headers
    updateFormData("standard", standardKey)

    const newClassifications = standardsData.rows.map((row) => row[standardKey]).filter(Boolean) as string[]
    updateFormData("classification", newClassifications[0] || "")
  }

  const handlePressureDropChange = (index: number, field: keyof PressureDropItem, value: any) => {
    const newPressureDrop = [...formData.pressureDrop]
    ;(newPressureDrop[index] as any)[field] = value
    updateFormData("pressureDrop", newPressureDrop)
  }

  const handleNext = () => {
    // Navigate to next step
    router.push('/?step=3')
  }

  return (
    <div>
      <FormSection title="Standard & System Configuration" stepNumber={4}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          {/* Standard & Classification */}
          <div>
            <Label>Standard *</Label>
            <Select value={formData.standard} onValueChange={handleStandardChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(standardsData.headers).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Classification *</Label>
            <Select
              value={formData.classification}
              onValueChange={(value) => updateFormData("classification", value)}
              disabled={classificationOptions.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {classificationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Selection */}
          <div>
            <Label>System *</Label>
            <Select 
              value={formData.system} 
              onValueChange={(value) => {
                updateFormData("system", value)
                // Reset dependent fields when system changes
                if (value === "Air-Conditioning System") {
                  updateFormData("ventilationType", "")
                  updateFormData("acSystem", "Clean Room Air-Conditioning")
                } else {
                  updateFormData("coolingMethod", "")
                  updateFormData("acSystem", "")
                }
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Air-Conditioning System">Air-Conditioning System</SelectItem>
                <SelectItem value="Ventilation System">Ventilation System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on System Selection */}
          {formData.system === "Air-Conditioning System" && (
            <>
              <div>
                <Label>Air-Conditioning System Type *</Label>
                <Select value={formData.acSystem} onValueChange={(value) => updateFormData("acSystem", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clean Room Air-Conditioning">Clean Room Air-Conditioning</SelectItem>
                    <SelectItem value="Comfort AC">Comfort AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cooling Method *</Label>
                <Select value={formData.coolingMethod} onValueChange={(value) => updateFormData("coolingMethod", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chilled Water">Chilled Water</SelectItem>
                    <SelectItem value="Brine">Brine</SelectItem>
                    <SelectItem value="DX">DX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.system === "Ventilation System" && (
            <>
              <div>
                <Label>Ventilation System Type *</Label>
                <Select value={formData.ventilationType} onValueChange={(value) => updateFormData("ventilationType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classified ventilation supply">Classified ventilation supply</SelectItem>
                    <SelectItem value="Non-classified ventilation supply">Non-classified ventilation supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ventilation System Details</Label>
                <Input
                  value={formData.ventilationSystem}
                  onChange={(e) => updateFormData("ventilationSystem", e.target.value)}
                  className="mt-1"
                  placeholder="Enter ventilation system details..."
                />
              </div>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Operating Conditions" stepNumber={5}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          <div>
            <Label>Max Temp (°C) *</Label>
            <Input
              value={formData.maxTemp}
              onChange={(e) => updateFormData("maxTemp", e.target.value)}
              className="mt-1"
              placeholder="e.g., 24"
              required
            />
          </div>
          <div>
            <Label>Min Temp (°C) *</Label>
            <Input
              value={formData.minTemp}
              onChange={(e) => updateFormData("minTemp", e.target.value)}
              className="mt-1"
              placeholder="e.g., 20"
              required
            />
          </div>
          <div>
            <Label>Max RH% *</Label>
            <Input 
              value={formData.maxRh} 
              onChange={(e) => updateFormData("maxRh", e.target.value)} 
              className="mt-1" 
              placeholder="e.g., 60"
              required 
            />
          </div>
          <div>
            <Label>Min RH% *</Label>
            <Input 
              value={formData.minRh} 
              onChange={(e) => updateFormData("minRh", e.target.value)} 
              className="mt-1" 
              placeholder="e.g., 45"
              required 
            />
          </div>
          <div>
            <Label>Air Changes / Hr</Label>
            <Input value={formData.airChanges} disabled className="mt-1 bg-gray-100 font-semibold" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Filtration & AHU Details" stepNumber={6}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Filtration Checkboxes */}
          <div>
            <Label className="mb-4 block font-medium">Filtration</Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                {filterOptions.column1.map((filter) => (
                  <div key={filter} className="mb-2 flex items-center space-x-2">
                    <Checkbox
                      id={filter.replace(/\s+/g, "-")}
                      checked={!!formData.filters[filter]}
                      onCheckedChange={(checked) =>
                        updateFormData("filters", { ...formData.filters, [filter]: checked })
                      }
                    />
                    <Label htmlFor={filter.replace(/\s+/g, "-")} className="text-sm font-normal">
                      {filter}
                    </Label>
                  </div>
                ))}
              </div>
              <div>
                {filterOptions.column2.map((filter) => (
                  <div key={filter} className="mb-2 flex items-center space-x-2">
                    <Checkbox
                      id={filter.replace(/\s+/g, "-")}
                      checked={!!formData.filters[filter]}
                      onCheckedChange={(checked) =>
                        updateFormData("filters", { ...formData.filters, [filter]: checked })
                      }
                    />
                    <Label htmlFor={filter.replace(/\s+/g, "-")} className="text-sm font-normal">
                      {filter}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AHU Specs */}
          <div>
            <Label className="mb-4 block font-medium">AHU Construction Specifications</Label>
            <div className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
              {ahuSpecOptions.map((spec) => (
                <div key={spec} className="flex items-center space-x-3">
                  <Checkbox
                    id={spec.replace(/\s+/g, "-")}
                    checked={formData.ahuSpecs.includes(spec)}
                    onCheckedChange={(checked) => {
                      const currentSpecs = formData.ahuSpecs
                      const newSpecs = checked ? [...currentSpecs, spec] : currentSpecs.filter((s) => s !== spec)
                      updateFormData("ahuSpecs", newSpecs)
                    }}
                  />
                  <Label htmlFor={spec.replace(/\s+/g, "-")} className="font-normal text-gray-700">
                    {spec}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Fields */}
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <div>
            <Label>No. of Filtration Stages in AHU</Label>
            <Input value={formData.filtrationStages} disabled className="mt-1 bg-gray-100 font-semibold" />
          </div>
          <div>
            <Label>Static Pressure of AHU (Auto Generation)</Label>
            <Input value={formData.staticPressure} disabled className="mt-1 bg-gray-100 font-semibold" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Pressure Drop Calculation">
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">Pressure Drop Configuration</p>
          <p className="text-amber-700">Select the pressure drop items that apply to your system. The total static pressure will be calculated automatically based on your selections.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Pressure Drop</TableHead>
                <TableHead>Guage Selected</TableHead>
                <TableHead className="text-center">Select</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.pressureDrop.map((item, index) => (
                <TableRow key={item.code}>
                  <TableCell>
                    <Input
                      value={item.initialValue}
                      onChange={(e) => handlePressureDropChange(index, "initialValue", e.target.value)}
                      className="h-8 w-16"
                    />
                  </TableCell>
                  <TableCell className="text-xs">{item.description}</TableCell>
                  <TableCell>
                    <Input
                      value={item.pressureDrop}
                      onChange={(e) => handlePressureDropChange(index, "pressureDrop", e.target.value)}
                      className="h-8 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.guageSelected}
                      onChange={(e) => handlePressureDropChange(index, "guageSelected", e.target.value)}
                      className="h-8 w-24"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={(checked) => handlePressureDropChange(index, "selected", checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      <div className="p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="rounded-md bg-blue-50 p-4">
          <Label className="text-sm font-semibold text-blue-800">Selected Class</Label>
          <p className="font-mono text-blue-900">
            {formData.standard} Standard And Class - {formData.classification || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-200/80 bg-gray-50 px-6 py-4">
        <Button type="button" variant="outline" onClick={onBack} size="lg" className="rounded-full bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} size="lg" className="rounded-full bg-green-600 hover:bg-green-700">
          Next Step
        </Button>
      </div>
    </div>
  )
}
