import { createFileRoute } from "@tanstack/react-router"
import { LogIn, LogOut, Plus, Settings, User } from "lucide-react"
import { useAtomSet } from "@effect-atom/atom-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RpcClientTag } from "@/lib/rpc"

export const Route = createFileRoute("/" as unknown as undefined)({
  component: Home,
})

function Home() {
  const session = auth.useSession()
  const createBook = useAtomSet(RpcClientTag.mutation("BooksCreate"))

  if (session.isPending) {
    return <div className="p-4">Loading...</div>
  }

  if (!session.data) {
    return (
      <div className="p-4">
        <Button
          onClick={() =>
            auth.signIn.social({
              provider: "github",
              callbackURL: window.location.href,
            })
          }
        >
          <LogIn className="mr-2 size-4" />
          Sign in with GitHub
        </Button>
      </div>
    )
  }

  const user = session.data.user

  return (
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full">
          <Avatar size="sm">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => auth.signOut()}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="mt-4">
        <Button
          onClick={() =>
            createBook({
              payload: {
                title: "Test Book",
                author: "Test Author",
              },
            })
          }
        >
          <Plus className="mr-2 size-4" />
          Create Book
        </Button>
      </div>
    </div>
  )
}
