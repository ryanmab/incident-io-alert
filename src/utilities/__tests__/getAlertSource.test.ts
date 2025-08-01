const getInput = jest.fn();

import { getAlertSource } from "utilities";

jest.mock("@actions/core", () => ({
    ...jest.requireActual("@actions/core"),
    getInput,
}));

describe("Given the alert source helper", () => {
    it("should return the configuration ID and token from the provided inputs", () => {
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
