// Drop-in replacement for snapdom/vitest.config.js.
// Adds snapdiff file-system commands to the existing browser config.

import { defineConfig } from 'vitest/config'
import { snapDiffCommands } from '@zumer/snapdiff/vitest'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      screenshotFailures: false, 
      instances: [{ browser: 'chromium' }],
      commands: snapDiffCommands({ baseDir: '__snapshots__/visual' }),
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
    },
  },
})
