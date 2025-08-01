export class EventResponseError extends Error {
    static requestFailed(error: Error) {
        return new EventResponseError(`An error occurred while sending the event: ${error.message}`);
    }

    static invalidStatusCode(statusCode: number) {
        return new EventResponseError(
            `The event was not accepted by the alert source configuration. The status code was ${statusCode}. Expected a 202 status code.`,
        );
    }

    static invalidResponseStatus(status?: string) {
        return new EventResponseError(
            `Alert source configuration returned a status of ${status}. Expected "accepted".`,
        );
    }

    static missingDeduplicationKey() {
        return new EventResponseError("The alert source configuration did not return a deduplication key.");
    }
}
