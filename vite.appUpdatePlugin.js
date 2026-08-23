import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORAGE_FRIENDLY_ID = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function readSwTemplate(buildId) {
  const templatePath = path.join(__dirname, 'scripts', 'sw-template.js')
  return fs.readFileSync(templatePath, 'utf8').replaceAll('__BUILD_ID__', buildId)
}

/**
 * Emits version.json + a build-stamped sw.js so installed home-screen apps
 * can detect deploys and refresh automatically.
 */
export function appUpdatePlugin() {
  const buildId = STORAGE_FRIENDLY_ID()

  return {
    name: 'app-update',
    config() {
      return {
        define: {
          __APP_BUILD_ID__: JSON.stringify(buildId),
        },
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (url.includes('/version.json')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify({ version: buildId }))
          return
        }
        if (url.includes('/sw.js')) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Service-Worker-Allowed', '/')
          res.end(readSwTemplate(buildId))
          return
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: buildId }, null, 2),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: readSwTemplate(buildId),
      })
    },
  }
}
