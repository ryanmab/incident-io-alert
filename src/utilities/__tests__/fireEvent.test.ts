import { jest } from "@jest/globals";

describe("Given the fire event helper", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("should handle a successful event being fired", async () => {
        const { HttpClient } = await import("@actions/http-client");
        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
            },
        }));

        jest.spyOn(HttpClient.prototype, "postJson").mockImplementationOnce(async () => {
            return Promise.resolve({
                headers: {},
                statusCode: 202,
                result: {
                    deduplication_key: "mock-deduplication-key",
                    status: "accepted",
                    message: "Event fired successfully",
                },
            });
        });

        const { fireEvent } = await import("../fireEvent.js");

        const { deduplicationKey, status, message } = await fireEvent(
            {
                configurationId: "12345",
                token: "mock-token",
            },
            {
                title: "Test Event",
                status: "firing",
            },
        );

        const [url, body, headers] = jest.spyOn(HttpClient.prototype, "postJson").mock.calls[0];

        expect(url).toBe("https://api.incident.io/v2/alert_events/http/12345");
        expect(body).toMatchObject({
            title: "Test Event",
            status: "firing",
        });
        expect(headers).toStrictEqual({
            authorization: "Bearer mock-token",
        });

        expect(deduplicationKey).toBe("mock-deduplication-key");
        expect(status).toBe("accepted");
        expect(message).toBe("Event fired successfully");
    });

    it("should handle a 404 error for invalid id", async () => {
        const { HttpClient } = await import("@actions/http-client");
        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
            },
        }));

        jest.spyOn(HttpClient.prototype, "postJson").mockImplementationOnce(async () => {
            return Promise.resolve({
                headers: {},
                statusCode: 404,
                result: {},
            });
        });

        const { fireEvent } = await import("../fireEvent.js");

        await expect(
            async () =>
                await fireEvent(
                    {
                        configurationId: "some-invalid-id",
                        token: "mock-token",
                    },
                    {
                        title: "Test Event",
                        status: "firing",
                    },
                ),
        ).rejects.toThrow(
            "The event was not accepted by the alert source configuration. The status code was 404. Expected a 202 status code.",
        );
    });

    it("should handle a 403 error for invalid token", async () => {
        const { HttpClient } = await import("@actions/http-client");
        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "mock-owner",
                    repo: "mock-repo",
                },
            },
        }));

        jest.spyOn(HttpClient.prototype, "postJson").mockImplementationOnce(async () => {
            return Promise.resolve({
                headers: {},
                statusCode: 403,
                result: {},
            });
        });

        const { fireEvent } = await import("../fireEvent.js");
        await expect(
            async () =>
                await fireEvent(
                    {
                        configurationId: "12345",
                        token: "not-a-valid-token",
                    },
                    {
                        title: "Test Event",
                        status: "firing",
                    },
                ),
        ).rejects.toThrow(
            "The event was not accepted by the alert source configuration. The status code was 403. Expected a 202 status code.",
        );
    });
});
