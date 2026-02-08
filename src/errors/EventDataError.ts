import { EventStatus } from "@utilities";

export class EventDataError extends Error {
    static invalidMetadata(error: Error) {
        return new EventDataError(`An error occurred while parsing the metadata as JSON: ${error.message}`);
    }

    static invalidInput(error: Error) {
        return new EventDataError(`An error occurred while reading the alert source inputs. Error: ${error.message}`);
    }

    static invalidStatus(status: string) {
        return new EventDataError(`Invalid event status given: ${status}. Only ${EventStatus.join(", ")} are allowed.`);
    }

    static invalidDeduplicationKeyInput(error: Error) {
        return new EventDataError(`An error occurred while trying to read the deduplication key input: ${error}`);
    }
}
