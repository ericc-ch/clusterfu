import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RepoFormProps {
  onSubmit: () => void
  disabled?: boolean
}

export function RepoForm({ onSubmit, disabled }: RepoFormProps) {
  const [owner, setOwner] = useState("")
  const [repo, setRepo] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!owner.trim()) {
      newErrors.owner = "Owner is required"
    } else if (!/^[a-zA-Z0-9-_.]+$/.test(owner)) {
      newErrors.owner =
        "Owner can only contain letters, numbers, dashes, underscores, and dots"
    }

    if (!repo.trim()) {
      newErrors.repo = "Repository name is required"
    } else if (!/^[a-zA-Z0-9-_.]+$/.test(repo)) {
      newErrors.repo =
        "Repository can only contain letters, numbers, dashes, underscores, and dots"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    onSubmit()
  }

  const clearError = (field: "owner" | "repo") => {
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="owner">Owner</Label>
        <Input
          id="owner"
          value={owner}
          onChange={(e) => {
            setOwner(e.target.value)
            clearError("owner")
          }}
          placeholder="e.g., facebook"
          disabled={disabled}
          autoComplete="off"
        />
        {errors.owner && <p className="text-sm text-red-500">{errors.owner}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="repo">Repository</Label>
        <Input
          id="repo"
          value={repo}
          onChange={(e) => {
            setRepo(e.target.value)
            clearError("repo")
          }}
          placeholder="e.g., react"
          disabled={disabled}
          autoComplete="off"
        />
        {errors.repo && <p className="text-sm text-red-500">{errors.repo}</p>}
      </div>

      <Button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full"
      >
        {isSubmitting ?
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        : "Process Repository"}
      </Button>
    </form>
  )
}
