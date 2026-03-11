import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'apps/api/src/application/use-cases/**/*.ts',
    'apps/video-processor/src/application/use-cases/**/*.ts',
    'apps/video-processor/src/application/video-processor/**/*.ts',
    'apps/user-notifier/src/application/use-cases/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.mock.ts',
    '!**/test/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'json',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.spec.ts$',
    '.mock.ts$',
  ],
  testEnvironment: 'node',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
