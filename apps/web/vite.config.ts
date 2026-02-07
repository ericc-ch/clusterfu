import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import alchemy from "alchemy/cloudflare/tanstack-start"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    tailwindcss(),
    alchemy(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    react(),
  ],
})
