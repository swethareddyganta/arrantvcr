import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "Customer & Project Details" },
  { id: 2, name: "Technical Specifications" },
  { id: 3, name: "HVAC Calculations" },
]

interface ProgressStepperProps {
  currentStep: number
  formData?: any
  onStepClick?: (step: number) => void
}

export function ProgressStepper({ currentStep, formData, onStepClick }: ProgressStepperProps) {
  const router = useRouter()

  const validateStep = (stepNumber: number): boolean => {
    if (!formData) return false
    
    if (stepNumber === 1) {
      const step1Fields = ['customerName', 'customerAddress', 'branchName', 'projectName', 'location']
      return step1Fields.every(field => {
        const value = formData[field]
        return value && (typeof value !== 'string' || value.trim() !== '')
      })
    } else if (stepNumber === 2) {
      const step2Fields = ['standard', 'classification', 'system', 'maxTemp', 'minTemp', 'maxRh', 'minRh']
      const basicValid = step2Fields.every(field => {
        const value = formData[field]
        return value && (typeof value !== 'string' || value.trim() !== '')
      })
      
      if (!basicValid) return false
      
      // Additional validation for conditional fields
      if (formData.system === "Air-Conditioning System") {
        return formData.acSystem && formData.acSystem.trim() !== '' && 
               formData.coolingMethod && formData.coolingMethod.trim() !== ''
      } else if (formData.system === "Ventilation System") {
        return formData.ventilationType && formData.ventilationType.trim() !== ''
      }
      
      return true
    }
    
    return false
  }

  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId)
    } else {
      router.push(`/?step=${stepId}`)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center rounded-full bg-gray-200/70 p-1">
        {steps.map((step, index) => {
          const isCompleted = validateStep(step.id)
          const isCurrent = currentStep === step.id
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-semibold transition-colors cursor-pointer",
                  isCurrent
                    ? "bg-blue-600 text-white shadow"
                    : isCompleted
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-transparent text-gray-600 hover:bg-gray-300/50",
                )}
              >
                <span
                  className={cn(
                    "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isCurrent 
                      ? "bg-white/20" 
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-300/80 text-gray-700",
                  )}
                >
                  {isCompleted ? "✓" : step.id}
                </span>
                {step.name}
              </button>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "mx-2 h-1 w-4 rounded-full",
                    isCompleted ? "bg-green-300" : "bg-gray-300"
                  )} 
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
