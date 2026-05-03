import { copyFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(backendRoot, 'dist', 'lib'), { recursive: true })
copyFileSync(
  join(backendRoot, 'src', 'lib', 'demo-sample.pdf'),
  join(backendRoot, 'dist', 'lib', 'demo-sample.pdf')
)
