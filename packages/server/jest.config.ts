import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default config;
