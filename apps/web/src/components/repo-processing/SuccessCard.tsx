import { Check, FileCode, GitCommit, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProcessingResult {
  issues: number
  pullRequests: number
  vectors: number
  fileSize: string
  commitSha: string
  filePath: string
}

interface SuccessCardProps {
  result: ProcessingResult
  onReset: () => void
}

export function SuccessCard({ result, onReset }: SuccessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          Processing Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted space-y-1 rounded-lg p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="text-xs">Issues</span>
            </div>
            <p className="text-2xl font-bold">{result.issues}</p>
          </div>
          <div className="bg-muted space-y-1 rounded-lg p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              <span className="text-xs">Pull Requests</span>
            </div>
            <p className="text-2xl font-bold">{result.pullRequests}</p>
          </div>
          <div className="bg-muted space-y-1 rounded-lg p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="text-xs">Vectors</span>
            </div>
            <p className="text-2xl font-bold">{result.vectors}</p>
          </div>
          <div className="bg-muted space-y-1 rounded-lg p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span className="text-xs">File Size</span>
            </div>
            <p className="text-2xl font-bold">{result.fileSize}</p>
          </div>
        </div>

        <div className="border-border space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">File Path</span>
            <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
              {result.filePath}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Commit SHA</span>
            <code className="bg-muted rounded px-2 py-1 font-mono text-sm text-cyan-400">
              {result.commitSha}
            </code>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onReset} variant="outline" className="w-full">
          Process Another Repository
        </Button>
      </CardFooter>
    </Card>
  )
}
