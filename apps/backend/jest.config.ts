import type { Config } from 'jest'
import { createDefaultPreset } from 'ts-jest'

const config: Config = {
  // [...]
  testEnvironment: "<rootDir>/src/tests/DatabaseEnvironment.cjs",
  testTimeout: 15000,
  forceExit: true,
  detectOpenHandles: true,
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@scalar/express-api-reference$': '<rootDir>/src/tests/mocks/scalarExpressApiReference.ts',
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupAfterEnv.ts"],
  globalSetup: "./src/tests/setup.ts",
  ...createDefaultPreset(),
}

export default config