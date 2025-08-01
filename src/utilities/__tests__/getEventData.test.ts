const getInput = jest.fn();

import { EventStatus, getEventData } from "utilities";

jest.mock("@actions/core", () => ({
    ...jest.requireActual("@actions/core"),
    getInput,
}));

describe("Given the event data helper", () => {
    it("should return all of the expected event data when event is firing", () => {
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

    it("should return all of the expected event data when event is resolved", () => {
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

    it("should handle an invalid status", () => {
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
                default:
                    throw new Error("Unexpected input");
            }
        });

        expect(() => getEventData()).toThrow(
            "Invalid event status given: not-a-valid-status. Only firing, resolved are allowed.",
        );
    });
});
