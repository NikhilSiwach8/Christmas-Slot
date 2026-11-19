import { defineConfig } from "vite"

// Static build with relative asset paths so it can be uploaded to the Stake Engine CDN as-is.
export default defineConfig({
  base: "./",
  build: { target: "es2022", assetsInlineLimit: 0, chunkSizeWarningLimit: 1500 },
  server: { port: 5173, host: true },
})
