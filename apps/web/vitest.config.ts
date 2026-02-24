import react from "@vitejs/plugin-react"
import { defineProject } from "vitest/config"

export default defineProject({
  plugins: [react()],
  test: {
    name: "web",
    // browser: {
    //   enabled: true,
    //   provider: playwright(),
    //   instances: [{ browser: "chromium" }],
    // },
  },
})
