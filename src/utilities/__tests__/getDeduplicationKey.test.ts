import { jest } from "@jest/globals";
const getInput = jest.fn();

describe("Given the deduplication key helper", () => {
    it("should predictably produce the same deduplication key per configuration", async () => {
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));
        jest.unstable_mockModule("@actions/github", () => ({
            ...actionsGithubModule,
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
                runAttempt: 1,
            },
        }));

        const { getDeduplicationKey } = await import("../getDeduplicationKey.js");

        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "99441e6e39cae2d2bf336a3a0959bbd6620f95b14dc3804edd5b5de043bb6a14",
        );

        expect(getDeduplicationKey({ configurationId: "6789" }, { title: "Test Alert" })).toBe(
            "54e12915dd25cf390f3abd9d818262284c2cabdcb43dff1d48a96aadb17da30c",
        );
    });

    it("should predictably produce a different deduplication key per event title", async () => {
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));
        jest.unstable_mockModule("@actions/github", () => ({
            ...actionsGithubModule,
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
                runAttempt: 1,
            },
        }));

        const { getDeduplicationKey } = await import("../getDeduplicationKey.js");

        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert 1" })).toBe(
            "abf76d30789b988cb49cf539fe43c250d65561143c8d6742ee75b7337e4726c3",
        );

        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert 2" })).toBe(
            "ed1a48f942add7bdb81f04987f7960d069f36bec8c0048fe1388a8a4aa7cad85",
        );
    });

    it("should produce the same deduplication key predictably", async () => {
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));
        jest.unstable_mockModule("@actions/github", () => ({
            ...actionsGithubModule,
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
                runAttempt: 1,
            },
        }));

        const { getDeduplicationKey } = await import("../getDeduplicationKey.js");

        expect(getDeduplicationKey({ configurationId: "999" }, { title: "Test Alert" })).toBe(
            "df5d6858912bf4fc5818d5fe673276bc477fca5aa713279db645e95b7c165569",
        );
        expect(getDeduplicationKey({ configurationId: "999" }, { title: "Test Alert" })).toBe(
            "df5d6858912bf4fc5818d5fe673276bc477fca5aa713279db645e95b7c165569",
        );
    });

    it("should produce a different deduplication key per run attempt", async () => {
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));
        jest.unstable_mockModule("@actions/github", () => ({
            ...actionsGithubModule,
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
                runAttempt: 2,
            },
        }));

        const { getDeduplicationKey } = await import("../getDeduplicationKey.js");
        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "99441e6e39cae2d2bf336a3a0959bbd6620f95b14dc3804edd5b5de043bb6a14", // Notice, it's a different hash to the test case above
        );
    });

    it("should prioritise a caller-provided deduplication key", async () => {
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));
        jest.unstable_mockModule("@actions/github", () => ({
            ...actionsGithubModule,
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
                runAttempt: 1,
            },
        }));

        const { getDeduplicationKey } = await import("../getDeduplicationKey.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "deduplication_key":
                    return "deduplication-key-mock-value";
                default:
                    throw new Error("Unexpected input");
            }
        });

        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "deduplication-key-mock-value",
        );
        expect(getInput).toHaveBeenCalledWith("deduplication_key", { trimWhitespace: true, required: false });
    });
});
