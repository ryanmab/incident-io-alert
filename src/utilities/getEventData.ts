import { getInput } from "@actions/core";
import { Event, EventStatus } from "utilities";
import { EventDataError } from "errors";

/**
 * Get the event data from the action inputs.
 *
 * @throws EventDataError
 */
export const getEventData = (): Event => {
    let title;
    let description;

    try {
        title = getInput("title", { trimWhitespace: true, required: true });
        description = getInput("description", { trimWhitespace: false, required: true });
    } catch (error) {
        if (error instanceof Error) {
            throw EventDataError.invalidInput(error);
        }

        throw new EventDataError("An unknown error occurred while reading the event data inputs.");
    }

    const status =
        (getInput("status", { trimWhitespace: true, required: false }) as (typeof EventStatus)[number] | undefined) ??
        ("firing" satisfies (typeof EventStatus)[number]);

    if (!EventStatus.includes(status)) {
        /**
         * Status wasn't valid, so we should throw an error.
         */
        throw EventDataError.invalidStatus(status);
    }

    try {
        const metadata = getInput("metadata", { trimWhitespace: true, required: false });

        return {
            title,
            status,
            description,
            metadata: metadata ? JSON.parse(metadata) : undefined,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw EventDataError.invalidMetadata(error);
        }

        throw new EventDataError("An unknown error occurred while parsing the metadata JSON.");
    }
};
