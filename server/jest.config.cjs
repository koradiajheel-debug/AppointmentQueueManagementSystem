module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@queuesmart/shared$': '<rootDir>/../packages/shared/src/schemas/index.ts',
    '^@queuesmart/shared/schemas$': '<rootDir>/../packages/shared/src/schemas/index.ts',
    '^@queuesmart/shared/types$': '<rootDir>/../packages/shared/src/types/index.ts',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  verbose: true,
  testTimeout: 15000,
};
