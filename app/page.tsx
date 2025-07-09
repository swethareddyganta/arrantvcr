"use client"

import { useState, useEffect } from "react"
import { ProgressStepper } from "@/components/progress-stepper"
import { FormStepOne } from "@/components/form-step-one"
import { FormStepTwo } from "@/components/form-step-two"
import { FormStepThree } from "@/components/form-step-three"
import { ArrantHeader } from "@/components/arrant-header"
import { pressureDropData, type standardsData } from "@/lib/standards-data"
import { classAirChargesData } from "@/lib/class-air-charges-data"
import { useToast } from "@/components/ui/use-toast"

export type PressureDropItem = {
  initialValue: string
  code: string
  description: string
  pressureDrop: string
  guageSelected: string
  selected: boolean
}

export type FormData = {
  // Step 1
  customerName: string
  customerAddress: string
  branchName: string
  projectName: string
  location: string
  locationData?: { lat: number; lng: number; address?: string }
  uniqueId: string
  phone: string
  email: string
  otherInfo: string
  // Step 2
  standard: keyof (typeof standardsData)["headers"]
  classification: string
  system: string
  acSystem: string
  ventilationSystem: string
  coolingMethod: string
  ventilationType: string
  maxTemp: string
  minTemp: string
  maxRh: string
  minRh: string
  airChanges: string // New field
  filters: Record<string, boolean>
  ahuSpecs: string[]
  filtrationStages: string
  staticPressure: string
  pressureDrop: PressureDropItem[]
}

export default function ModernForm() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  
  // Handle URL parameters after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const stepParam = urlParams.get('step')
      if (stepParam) {
        setStep(parseInt(stepParam))
      }
    }
  }, [])

  // Test toast on mount
  useEffect(() => {
    toast({
      title: "Welcome",
      description: "Form is ready. Please fill in the required fields.",
    })
  }, [toast])
  const [formData, setFormData] = useState<FormData>({
    // Step 1 Data
    customerName: "",
    customerAddress: "",
    branchName: "",
    projectName: "",
    location: "",
    locationData: undefined,
    uniqueId: "",
    phone: "",
    email: "",
    otherInfo: "",
    // Step 2 Data
    standard: "TGA",
    classification: "3500 K",
    system: "Air-Conditioning System",
    acSystem: "Clean Room Air-Conditioning",
    ventilationSystem: "",
    coolingMethod: "Chilled Water",
    ventilationType: "",
    maxTemp: "24",
    minTemp: "20",
    maxRh: "60",
    minRh: "45",
    airChanges: "N/A", // Initial value
    filters: {
      "10 M Supply": true,
      "10 M Exhaust": true,
      "5 M Supply": true,
      "1 M Supply": true,
    },
    ahuSpecs: [
      "25mm Thick Panel & AL Profile",
      "Panels with both side 24G Precoated GI Sheet",
      "Aluminium Profile VCD for Fresh Air- Supply Air & Return Air",
      "Fire Control Damper for Supply & Return Air",
      "Variable Frequency Drive (VFD) - Not Required",
      "Pressure Guage (0-25mm) for 5 Micr Filter Section",
    ],
    filtrationStages: "4",
    staticPressure: "145",
    pressureDrop: pressureDropData,
  })

  const validateStep = (stepNumber: number): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = []
    
    if (stepNumber === 1) {
      const step1Fields = ['customerName', 'customerAddress', 'branchName', 'projectName']
      step1Fields.forEach(field => {
        const value = formData[field as keyof FormData]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(field)
        }
      })
      
      // Special validation for location - check both location string and locationData
      if (!formData.location?.trim() || !formData.locationData) {
        missingFields.push('location')
      }
    } else if (stepNumber === 2) {
      const step2Fields = ['standard', 'classification', 'system', 'maxTemp', 'minTemp', 'maxRh', 'minRh']
      step2Fields.forEach(field => {
        const value = formData[field as keyof FormData]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(field)
        }
      })
      
      // Additional validation for conditional fields
      if (formData.system === "Air-Conditioning System") {
        if (!formData.acSystem || formData.acSystem.trim() === '') missingFields.push('acSystem')
        if (!formData.coolingMethod || formData.coolingMethod.trim() === '') missingFields.push('coolingMethod')
      } else if (formData.system === "Ventilation System") {
        if (!formData.ventilationType || formData.ventilationType.trim() === '') missingFields.push('ventilationType')
      }
    }
    
    return { isValid: missingFields.length === 0, missingFields }
  }

  const handleStepClick = (targetStep: number) => {
    // Check if we can navigate to the target step
    for (let step = 1; step < targetStep; step++) {
      const validation = validateStep(step)
      if (!validation.isValid) {
        // Navigate to the first step with missing fields
        setStep(step)
        const fieldNames = validation.missingFields.map(field => {
          const fieldMap: Record<string, string> = {
            'customerName': 'Customer Name',
            'customerAddress': 'Customer Address', 
            'branchName': 'Unit / Branch Name',
            'projectName': 'Project / Product Name',
            'location': 'Location Selection',
            'standard': 'Standard',
            'classification': 'Classification',
            'system': 'System Type',
            'maxTemp': 'Maximum Temperature',
            'minTemp': 'Minimum Temperature',
            'maxRh': 'Maximum Relative Humidity',
            'minRh': 'Minimum Relative Humidity',
            'acSystem': 'AC System Type',
            'coolingMethod': 'Cooling Method',
            'ventilationType': 'Ventilation Type'
          }
          return fieldMap[field] || field
        })
        toast({
          variant: "destructive",
          title: `Step ${step} Incomplete`,
          description: `Please complete the following fields: ${fieldNames.join(', ')}`,
        })
        return
      }
    }
    
    // If all previous steps are valid, navigate to target step
    setStep(targetStep)
    toast({
      title: "Navigation Successful",
      description: `Moved to Step ${targetStep}`,
    })
  }

  const handleNext = () => {
    const validation = validateStep(step)
    if (!validation.isValid) {
      const fieldNames = validation.missingFields.map(field => {
        const fieldMap: Record<string, string> = {
          'customerName': 'Customer Name',
          'customerAddress': 'Customer Address', 
          'branchName': 'Unit / Branch Name',
          'projectName': 'Project / Product Name',
          'location': 'Location Selection',
          'standard': 'Standard',
          'classification': 'Classification',
          'system': 'System Type',
          'maxTemp': 'Maximum Temperature',
          'minTemp': 'Minimum Temperature',
          'maxRh': 'Maximum Relative Humidity',
          'minRh': 'Minimum Relative Humidity',
          'acSystem': 'AC System Type',
          'coolingMethod': 'Cooling Method',
          'ventilationType': 'Ventilation Type'
        }
        return fieldMap[field] || field
      })
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: `Please fill in the following required fields: ${fieldNames.join(', ')}`,
      })
      return
    }
    setStep((prev) => Math.min(prev + 1, 3))
    toast({
      title: `Step ${step} Completed`,
      description: `All required fields are filled. Moving to Step ${step + 1}...`,
    })
  }
  
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Auto-calculation and conditional logic
  useEffect(() => {
    // 1. Generate unique ID based on customer name and project name
    if (formData.customerName && formData.projectName) {
      const customerPrefix = formData.customerName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 3)
      
      const projectPrefix = formData.projectName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 3)
      
      const uniqueId = `${customerPrefix}${projectPrefix}${Date.now().toString().slice(-4)}`
      updateFormData("uniqueId", uniqueId)
    }

    // 2. Auto-calculate filtration stages
    const selectedFiltersCount = Object.values(formData.filters).filter(Boolean).length
    updateFormData("filtrationStages", selectedFiltersCount.toString())

    // 3. Auto-calculate static pressure
    const totalPressure = formData.pressureDrop
      .filter((item) => item.selected)
      .reduce((sum, item) => {
        const pressureValue = Number.parseInt(item.initialValue, 10)
        return sum + (isNaN(pressureValue) ? 0 : pressureValue)
      }, 0)
    updateFormData("staticPressure", totalPressure.toString())

    // 4. Conditional logic for systems
    if (formData.system === "Air-Conditioning System") {
      if (formData.ventilationSystem !== "") {
        updateFormData("ventilationSystem", "")
      }
    }

    // 5. Auto-calculate Air Changes
    const airChangeValue =
      classAirChargesData[formData.classification]?.[formData.standard] ??
      classAirChargesData[formData.classification]?.EUGMP ?? // Fallback for generic classes
      "N/A"
    updateFormData("airChanges", airChangeValue.toString())
  }, [formData.customerName, formData.projectName, formData.filters, formData.pressureDrop, formData.system, formData.classification, formData.standard])

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ArrantHeader />
        <ProgressStepper currentStep={step} formData={formData} onStepClick={handleStepClick} />
        <div className="mt-10 rounded-xl border border-gray-200/80 bg-white shadow-sm">
          {step === 1 && <FormStepOne formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {step === 2 && <FormStepTwo formData={formData} updateFormData={updateFormData} onBack={handleBack} />}
          {step === 3 && <FormStepThree formData={formData} updateFormData={updateFormData} onBack={handleBack} />}
        </div>
      </div>
    </main>
  )
}
