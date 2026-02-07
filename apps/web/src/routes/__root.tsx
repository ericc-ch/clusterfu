import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { RegistryProvider } from "@effect-atom/atom-react"
import type React from "react"
import globalCss from "../global.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Starter Effect",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: globalCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <RegistryProvider>{children}</RegistryProvider>
        <Scripts />
      </body>
    </html>
  )
}
