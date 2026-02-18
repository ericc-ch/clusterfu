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
        title: "Polarity",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: globalCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
