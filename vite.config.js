import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { execSync } from 'node:child_process'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const rootDir = dirname(fileURLToPath(import.meta.url))

function safeGitSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim() }
  catch { return 'unknown' }
}

function discoverCollections() {
  const scope = join(rootDir, 'node_modules', '@tweakch')
  if (!existsSync(scope)) return []
  return readdirSync(scope).filter((name) => name.startsWith('collection-'))
}

function webreaderCollectionsPlugin() {
  const virtualId = 'virtual:webreader-collections'
  const resolvedId = '\0' + virtualId
  return {
    name: 'webreader-collections',
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      const names = discoverCollections()
      const imports = names
        .map((n, i) => `import c${i} from '@tweakch/${n}';`)
        .join('\n')
      const arr = names.map((_, i) => `c${i}`).join(', ')
      return `${imports}\nexport default [${arr}];\n`
    },
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || safeGitSha()),
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react(), webreaderCollectionsPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Current app bundle is intentionally larger than Vite's default warning threshold.
    chunkSizeWarningLimit: 6500,
  },
  server: {
    port: 5173,
    open: false,
    middlewareMode: false
  },
  css: {
    postcss: './postcss.config.js'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/unit/setup.js',
    include: ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
})
