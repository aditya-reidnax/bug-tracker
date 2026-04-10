import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
};

export default config;
