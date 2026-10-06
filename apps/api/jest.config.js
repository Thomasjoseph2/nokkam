/** @type {import('jest').Config['transform']} */
const swc = {
  '^.+\\.ts$': [
    '@swc/jest',
    {
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2022',
      },
    },
  ],
};

/** @type {import('jest').Config} */
const common = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: swc,
};

/**
 * Three projects:
 *  - unit:        pure domain/application tests (*.spec.ts next to the code), no I/O.
 *  - integration: repositories & infrastructure against an in-memory MongoDB replica set.
 *  - e2e:         full HTTP app via supertest against an in-memory MongoDB replica set.
 */
/** @type {import('jest').Config} */
const config = {
  projects: [
    { ...common, displayName: 'unit', testMatch: ['<rootDir>/src/**/*.spec.ts'] },
    {
      ...common,
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.int-spec.ts'],
      globalSetup: '<rootDir>/test/support/mongo-global-setup.ts',
      globalTeardown: '<rootDir>/test/support/mongo-global-teardown.ts',
    },
    {
      ...common,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
      globalSetup: '<rootDir>/test/support/mongo-global-setup.ts',
      globalTeardown: '<rootDir>/test/support/mongo-global-teardown.ts',
    },
  ],
};

module.exports = config;
