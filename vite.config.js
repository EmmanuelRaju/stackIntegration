import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.html"),
      name: `[name].ext`
    },
    manifest: true,
    outDir: "eleventy/svelte_src",
    emptyOutDir: true,
  }
})
