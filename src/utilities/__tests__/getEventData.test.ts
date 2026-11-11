import { jest } from "@jest/globals";
import { EventStatus } from "@utilities";

const getInput = jest.fn();

jest.unstable_mockModule("@actions/github", () => ({
    context: {
        repo: {
            owner: "mock-owner",
            repo: "mock-repo",
        },
        serverUrl: "https://github.com",
        runId: 1,
        runAttempt: 2,
    },
}));

describe("Given the event data helper", () => {
    it("should return all of the expected event data when event is firing", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getEventData } = await import("../getEventData.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "title":
                    return "Mock title";
                case "status":
                    return "firing" satisfies (typeof EventStatus)[number];
                case "description":
                    return "Mock description";
                case "metadata":
                    return JSON.stringify({ key: "value" });
                case "source_url":
                    return "";
                default:
                    throw new Error("Unexpected input");
            }
        });

        const { title, status, description, metadata } = getEventData();

        expect(getInput).toHaveBeenCalledWith("title", { trimWhitespace: true, required: true });
        expect(getInput).toHaveBeenCalledWith("status", { trimWhitespace: true, required: false });
        expect(getInput).toHaveBeenCalledWith("description", { trimWhitespace: false, required: true });
        expect(getInput).toHaveBeenCalledWith("metadata", { trimWhitespace: true, required: false });

        expect(title).toBe("Mock title");
        expect(status).toBe("firing");
        expect(description).toBe("Mock description");
        expect(metadata).toEqual({ key: "value" });
    });

    it("should return all of the expected event data when event is resolved", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getEventData } = await import("../getEventData.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "title":
                    return "Mock title";
                case "status":
                    return "resolved" satisfies (typeof EventStatus)[number];
                case "description":
                    return "Mock description";
                case "metadata":
                    return JSON.stringify({ key: "value" });
                case "source_url":
                    return "";
                default:
                    throw new Error("Unexpected input");
            }
        });

        const { title, status, description, metadata } = getEventData();

        expect(getInput).toHaveBeenCalledWith("title", { trimWhitespace: true, required: true });
        expect(getInput).toHaveBeenCalledWith("status", { trimWhitespace: true, required: false });
        expect(getInput).toHaveBeenCalledWith("description", { trimWhitespace: false, required: true });
        expect(getInput).toHaveBeenCalledWith("metadata", { trimWhitespace: true, required: false });

        expect(title).toBe("Mock title");
        expect(status).toBe("resolved");
        expect(description).toBe("Mock description");
        expect(metadata).toEqual({ key: "value" });
    });

    it("should handle an invalid status", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getEventData } = await import("../getEventData.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "title":
                    return "Mock title";
                case "status":
                    return "not-a-valid-status";
                case "description":
                    return "Mock description";
                case "metadata":
                    return JSON.stringify({ key: "value" });
                case "source_url":
                    return "";
                default:
                    throw new Error("Unexpected input");
            }
        });

        expect(() => getEventData()).toThrow(
            "Invalid event status given: not-a-valid-status. Only firing, resolved are allowed.",
        );
    });

    it("should return the source URL when one is provided", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getEventData } = await import("../getEventData.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "title":
                    return "Mock title";
                case "status":
                    return "firing" satisfies (typeof EventStatus)[number];
                case "description":
                    return "Mock description";
                case "metadata":
                    return "";
                case "source_url":
                    return "https://example.com/alert";
                default:
                    throw new Error("Unexpected input");
            }
        });

        const { source_url } = getEventData();

        expect(getInput).toHaveBeenCalledWith("source_url", { trimWhitespace: true, required: false });
        expect(source_url).toBe("https://example.com/alert");
    });

    it("should default the source URL to the workflow URL when none is provided", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getEventData } = await import("../getEventData.js");

        getInput.mockImplementation((name) => {
            switch (name) {
                case "title":
                    return "Mock title";
                case "status":
                    return "firing" satisfies (typeof EventStatus)[number];
                case "description":
                    return "Mock description";
                case "metadata":
                    return "";
                case "source_url":
                    return "";
                default:
                    throw new Error("Unexpected input");
            }
        });

        expect(getEventData().source_url).toEqual("https://github.com/mock-owner/mock-repo/actions/runs/1/attempts/2");
    });
});