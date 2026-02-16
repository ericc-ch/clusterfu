import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessingSteps } from "@/components/repo-processing/ProcessingSteps"
import { RepoForm } from "@/components/repo-processing/RepoForm"
import { SuccessCard } from "@/components/repo-processing/SuccessCard"

const PROCESSING_STEPS = [
  { id: "fetch", label: "Fetching repository", duration: 1000 },
  { id: "issues", label: "Processing 42 issues", duration: 2000 },
  { id: "prs", label: "Processing 15 pull requests", duration: 1500 },
  { id: "embeddings", label: "Generating embeddings", duration: 2500 },
  { id: "file", label: "Creating vector file", duration: 800 },
  { id: "commit", label: "Committing changes", duration: 1200 },
]

const MOCK_RESULT = {
  issues: 42,
  pullRequests: 15,
  vectors: 57,
  fileSize: "45 KB",
  commitSha: "a1b2c3d",
  filePath: "/public/vectors/embeddings.bin",
}

type ProcessingState =
  | { type: "form" }
  | { type: "processing"; currentStep: number }
  | { type: "success" }

export default function RepoProcessingPage() {
  const [state, setState] = useState<ProcessingState>({ type: "form" })

  const handleSubmit = () => {
    setState({ type: "processing", currentStep: 0 })
  }

  const handleReset = () => {
    setState({ type: "form" })
  }

  useEffect(() => {
    if (state.type !== "processing") return

    const currentStepData = PROCESSING_STEPS[state.currentStep]
    if (!currentStepData) {
      setState({ type: "success" })
      return
    }

    const timer = setTimeout(() => {
      setState({ type: "processing", currentStep: state.currentStep + 1 })
    }, currentStepData.duration)

    return () => clearTimeout(timer)
  }, [state])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {state.type === "form" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Vectorize Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <RepoForm onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        )}

        {state.type === "processing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                Processing Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="opacity-50">
                <RepoForm onSubmit={() => {}} disabled />
              </div>
              <ProcessingSteps
                steps={PROCESSING_STEPS}
                currentStep={state.currentStep}
              />
            </CardContent>
          </Card>
        )}

        {state.type === "success" && (
          <SuccessCard result={MOCK_RESULT} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}
