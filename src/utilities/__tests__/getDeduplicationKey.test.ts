const context = {
    repo: {
        owner: "mock-owner",
        repo: "mock-repo",
    },
    runAttempt: 1,
};
const getInput = jest.fn();

import { getDeduplicationKey } from "utilities";

jest.mock("@actions/core", () => ({
    ...jest.requireActual("@actions/core"),
    getInput,
}));
jest.mock("@actions/github", () => ({
    ...jest.requireActual("@actions/github"),
    context,
}));

describe("Given the deduplication key helper", () => {
    it("should predictably produce the same deduplication key per configuration", () => {
        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "99441e6e39cae2d2bf336a3a0959bbd6620f95b14dc3804edd5b5de043bb6a14",
        );

        expect(getDeduplicationKey({ configurationId: "6789" }, { title: "Test Alert" })).toBe(
            "54e12915dd25cf390f3abd9d818262284c2cabdcb43dff1d48a96aadb17da30c",
        );
    });

    it("should predictably produce a different deduplication key per event title", () => {
        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert 1" })).toBe(
            "abf76d30789b988cb49cf539fe43c250d65561143c8d6742ee75b7337e4726c3",
        );

        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert 2" })).toBe(
            "ed1a48f942add7bdb81f04987f7960d069f36bec8c0048fe1388a8a4aa7cad85",
        );
    });

    it("should produce a different deduplication key per run attempt", () => {
        context.runAttempt = 2;
        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "e00d12cae0ce5b3e04f5e34e013ea7c4d077e3021eaf6f0823e4268b0fcd8c39",
        );

        context.runAttempt = 3;
        expect(getDeduplicationKey({ configurationId: "12345" }, { title: "Test Alert" })).toBe(
            "b157b89a55a0ddbcaa5a03fc5865ca16f14aaf2020e16d5ed177dd06ae6f234d",
        );
    });

    it("should produce the same deduplication key predictably", () => {
        expect(getDeduplicationKey({ configurationId: "999" }, { title: "Test Alert" })).toBe(
            "b4314dceccd72f807410e7d1734c2434fd1e6bdb4b14db6c637b8547ec6b5be1",
        );
        expect(getDeduplicationKey({ configurationId: "999" }, { title: "Test Alert" })).toBe(
            "b4314dceccd72f807410e7d1734c2434fd1e6bdb4b14db6c637b8547ec6b5be1",
        );
    });

    it("should prioritise a caller-provided deduplication key", () => {
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
