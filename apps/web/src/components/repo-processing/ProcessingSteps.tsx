import { Check, Loader2 } from "lucide-react"

interface Step {
  id: string
  label: string
  duration: number
}

interface ProcessingStepsProps {
  steps: Step[]
  currentStep: number
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isActive || isCompleted ? "opacity-100" : "opacity-40"
            }`}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              {isActive ?
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              : isCompleted ?
                <Check className="h-4 w-4 text-green-500" />
              : <div className="bg-muted-foreground h-2 w-2 rounded-full" />}
            </div>
            <span
              className={`text-sm ${
                isActive ? "font-medium text-cyan-400"
                : isCompleted ? "text-muted-foreground"
                : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
