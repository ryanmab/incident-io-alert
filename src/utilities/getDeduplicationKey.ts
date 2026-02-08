import { createHash } from "crypto";
import * as github from "@actions/github";
import { getAlertSource, getEventData } from "@utilities";
import { getInput } from "@actions/core";
import { EventDataError } from "@errors";

/**
 * Create a deduplication key for the alert.
 *
 * @throws EventDataError
 */
export const getDeduplicationKey = (
    { configurationId }: Pick<ReturnType<typeof getAlertSource>, "configurationId">,
    { title }: Pick<ReturnType<typeof getEventData>, "title">,
) => {
    try {
        const deduplicationKey = getInput("deduplication_key", { trimWhitespace: true, required: false });

        if (deduplicationKey) {
            /**
             * The caller has provided a deduplication key, so we should use that
             * instead of generating our own.
             */
            return deduplicationKey;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw EventDataError.invalidDeduplicationKeyInput(error);
        }

        throw new EventDataError("An unknown error occurred while reading the deduplication key inputs.");
    }

    const {
        repo: { owner, repo: repository },
        runId,
        runAttempt,
    } = github.context;

    const parts = [owner, repository, runId, runAttempt, configurationId, title];

    return createHash("sha256").update(parts.join("-")).digest("hex");
};
