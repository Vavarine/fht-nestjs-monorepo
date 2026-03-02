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
    'apps/api/src/application/entities/**/*.ts',
    'apps/api/src/application/use-cases/**/*.ts',
    'apps/video-processor/src/application/use-cases/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.mock.ts',
    '!**/test/**',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
