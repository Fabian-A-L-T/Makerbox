import type { Config } from 'jest'
import { createDefaultPreset } from 'ts-jest'

const config: Config = {
  // [...]
  testEnvironment: "node",
  testTimeout: 15000,
  forceExit: true,
  detectOpenHandles: true,
  globalSetup: "./src/tests/setup.ts",
  ...createDefaultPreset(),
}

export default config