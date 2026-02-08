import { jest } from "@jest/globals";
const getInput = jest.fn();

describe("Given the alert source helper", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("should return the configuration ID and token from the provided inputs", async () => {
        const actionsCoreModule = await import("@actions/core");
        jest.unstable_mockModule("@actions/core", () => ({
            ...actionsCoreModule,
            getInput,
        }));

        const { getAlertSource } = await import("../getAlertSource.js");
        getInput.mockImplementation((name) => {
            switch (name) {
                case "alert_source_id":
                    return "mock-configuration-id";
                case "alert_source_token":
                    return "mock-token";
                default:
                    throw new Error("Unexpected input");
            }
        });

        const { configurationId, token } = getAlertSource();

        expect(getInput).toHaveBeenCalledWith("alert_source_id", { trimWhitespace: true, required: true });
        expect(getInput).toHaveBeenCalledWith("alert_source_token", { trimWhitespace: true, required: true });

        expect(configurationId).toBe("mock-configuration-id");
        expect(token).toBe("mock-token");
    });
});
