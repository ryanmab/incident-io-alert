export default {
    moduleFileExtensions: ["js", "ts"],
    testMatch: ["**/*.test.ts"],
    resetMocks: true,
    preset: "ts-jest",
    resolver: "ts-jest-resolver",
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleFileExtensions: ["ts", "js"],
    moduleNameMapper: {
        "^@utilities$": "<rootDir>/src/utilities/index.ts",
        "^@errors$": "<rootDir>/src/errors/index.ts",
        "^@utilities(.*)$": "<rootDir>/src/utilities$1",
        "^@errors(.*)$": "<rootDir>/src/errors$1",
    },
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/__tests__/**/*",
        "!<rootDir>/src/runtime.ts",
        "!<rootDir>/src/**/index.ts",
    ],
    verbose: true,
};
