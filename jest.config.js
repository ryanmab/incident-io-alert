module.exports = {
    moduleFileExtensions: ["js", "ts"],
    testMatch: ["**/*.test.ts"],
    resetMocks: true,
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleNameMapper: {
        "^utilities(.*)$": "<rootDir>/src/utilities$1",
        "^errors(.*)$": "<rootDir>/src/errors$1",
    },
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/__tests__/**/*",
        "!<rootDir>/src/runtime.ts",
        "!<rootDir>/src/**/index.ts",
    ],
    verbose: true,
};
