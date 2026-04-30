/**
 * jest.config.cjs
 * Jest configuration for backend TypeScript and Express route tests.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to configure Jest/ts-jest for backend unit and supertest integration tests.
 */

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  setupFiles: ['<rootDir>/tests/setupEnv.cjs'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
};
