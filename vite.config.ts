import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/** Serve local files via /__local_file?path=/abs/path for ?yaml= URL param support. */
function localFileServer(): Plugin {
  return {
    name: 'local-file-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        if (url.pathname !== '/__local_file') return next()

        const filePath = url.searchParams.get('path')
        if (!filePath || !path.isAbsolute(filePath)) {
          res.statusCode = 400
          res.end('Missing or non-absolute path parameter')
          return
        }
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404
          res.end(`File not found: ${filePath}`)
          return
        }
        res.setHeader('Content-Type', 'text/yaml; charset=utf-8')
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localFileServer()],
})
