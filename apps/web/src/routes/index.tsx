import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertCircle,
  Check,
  Clock,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/" as unknown as undefined)({
  component: Home,
})

type RepositoryStatus =
  | "pending"
  | "backfilling"
  | "syncing"
  | "active"
  | "error"

interface Repository {
  id: string
  fullName: string
  description: string
  status: RepositoryStatus
  stars: number
  lastSyncAt: number | null
  errorMessage?: string
  issuesCount: number
}

const MOCK_REPOS: Repository[] = [
  {
    id: "1",
    fullName: "facebook/react",
    description:
      "A declarative, efficient, and flexible JavaScript library for building user interfaces",
    status: "active",
    stars: 230000,
    lastSyncAt: Date.now() - 1000 * 60 * 5,
    issuesCount: 1247,
  },
  {
    id: "2",
    fullName: "microsoft/vscode",
    description: "Visual Studio Code - open source code editor",
    status: "syncing",
    stars: 160000,
    lastSyncAt: Date.now() - 1000 * 60 * 30,
    issuesCount: 5234,
  },
  {
    id: "3",
    fullName: "vercel/next.js",
    description: "The React Framework for the Web",
    status: "active",
    stars: 120000,
    lastSyncAt: Date.now() - 1000 * 60 * 60 * 2,
    issuesCount: 892,
  },
  {
    id: "4",
    fullName: "torvalds/linux",
    description: "Linux kernel source tree",
    status: "backfilling",
    stars: 180000,
    lastSyncAt: null,
    issuesCount: 0,
  },
  {
    id: "5",
    fullName: "rust-lang/rust",
    description: "Empowering everyone to build reliable and efficient software",
    status: "error",
    stars: 95000,
    lastSyncAt: Date.now() - 1000 * 60 * 60 * 24,
    errorMessage: "Rate limit exceeded. Retry in 15 minutes.",
    issuesCount: 8234,
  },
  {
    id: "6",
    fullName: "nodejs/node",
    description: "Node.js JavaScript runtime",
    status: "pending",
    stars: 105000,
    lastSyncAt: null,
    issuesCount: 1240,
  },
]

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Never"
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function StatusBadge({
  status,
  errorMessage,
}: {
  status: RepositoryStatus
  errorMessage?: string | undefined
}) {
  const configs = {
    active: {
      icon: Check,
      label: "Indexed",
      className: "text-neutral-200 border-neutral-200/30 bg-neutral-200/10",
      dotClass: "bg-neutral-200",
    },
    backfilling: {
      icon: Loader2,
      label: "Indexing",
      className: "text-neutral-400 border-neutral-400/30 bg-neutral-400/10",
      dotClass: "bg-neutral-400",
    },
    syncing: {
      icon: RefreshCw,
      label: "Syncing",
      className: "text-neutral-400 border-neutral-400/30 bg-neutral-400/10",
      dotClass: "bg-neutral-400",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      className: "text-neutral-500 border-neutral-500/30 bg-neutral-500/10",
      dotClass: "bg-neutral-500",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className:
        "text-muted-foreground border-muted-foreground/30 bg-muted-foreground/10",
      dotClass: "bg-muted-foreground",
    },
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase",
        config.className,
      )}
      title={errorMessage}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      <Icon className="size-3" aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  )
}

function RepoRow({ repo }: { repo: Repository }) {
  return (
    <div
      className="border-border hover:bg-muted/30 flex cursor-pointer items-center justify-between border-b px-4 py-3"
      role="listitem"
    >
      <div className="flex min-w-0 items-center gap-4">
        <StatusBadge status={repo.status} errorMessage={repo.errorMessage} />
        <div className="min-w-0">
          <div className="truncate font-mono text-sm">
            <span className="text-muted-foreground">
              {repo.fullName.split("/")[0]}
            </span>
            <span className="text-muted-foreground/70">/</span>
            <span className="text-foreground">
              {repo.fullName.split("/")[1]}
            </span>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground/80 ml-4 flex shrink-0 items-center gap-6 text-[10px]">
        <span className="w-20 text-right">
          {repo.lastSyncAt ? formatRelativeTime(repo.lastSyncAt) : "Queued"}
        </span>
      </div>
    </div>
  )
}

function NavBar() {
  const session = auth.useSession()
  const user = session.data?.user

  return (
    <header className="border-border/50 bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-mono text-sm font-medium">
            polarity
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ?
            <Button
              variant="ghost"
              size="sm"
              onClick={() => auth.signOut()}
              className="border-border text-muted-foreground hover:text-foreground h-8"
            >
              Sign out
            </Button>
          : <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                auth.signIn.social({
                  provider: "github",
                  callbackURL: window.location.href,
                })
              }
              className="border-border text-muted-foreground hover:text-foreground h-8"
            >
              Sign in
            </Button>
          }
        </div>
      </div>
    </header>
  )
}

function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_REPOS
    const query = searchQuery.toLowerCase()
    return MOCK_REPOS.filter((repo) =>
      repo.fullName.toLowerCase().includes(query),
    )
  }, [searchQuery])

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr]">
      <NavBar />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background placeholder:text-muted-foreground/70 h-10 pl-10 font-mono text-sm"
              aria-label="Search repositories"
            />
          </div>

          {/* Repository List */}
          {filteredRepos.length === 0 ?
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search
                className="text-muted-foreground mb-4 size-8"
                aria-hidden="true"
              />
              <p className="text-muted-foreground font-mono text-sm">
                No repositories found
              </p>
            </div>
          : <div
              className="border-border border"
              role="list"
              aria-label="Repositories"
            >
              {filteredRepos.map((repo) => (
                <RepoRow key={repo.id} repo={repo} />
              ))}
            </div>
          }
        </div>
      </main>
    </div>
  )
}
