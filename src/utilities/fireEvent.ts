import { HttpClient } from "@actions/http-client";
import { debug } from "@actions/core";
import * as github from "@actions/github";
import { getAlertSource, getEventData, getDeduplicationKey } from "utilities";
import { EventResponseError } from "errors";
import { INCIDENT_IO_HTTP_URL, USER_AGENT } from "../constants";

/**
 * @see https://api-docs.incident.io/tag/Alert-Events-V2#operation/Alert%20Events%20V2_CreateHTTP!path=status&t=request
 */
export const EventStatus = ["firing", "resolved"] as const;

/**
 * @see https://api-docs.incident.io/tag/Alert-Events-V2#operation/Alert%20Events%20V2_CreateHTTP
 */
export type Event = {
    title: string;
    status: (typeof EventStatus)[number];
    description?: string;
    metadata?: { [key: string]: unknown };
};

export type EventResponse = {
    deduplicationKey: string;
    status: "accepted";
    message?: string;
};

/**
 * Fire an event to the incident.io alert source configuration.
 *
 * This should be a HTTP Alert source.
 *
 * @see https://api-docs.incident.io/tag/Alert-Events-V2#operation/Alert%20Events%20V2_CreateHTTP
 *
 * @throws EventDataError
 * @throws EventResponseError
 */
export const fireEvent = async (
    alertSource: ReturnType<typeof getAlertSource>,
    eventData: ReturnType<typeof getEventData>,
): Promise<EventResponse> => {
    const {
        repo: { owner, repo: repository },
        runId,
        runAttempt,
    } = github.context;

    const client = new HttpClient(USER_AGENT);

    const deduplicationKey = getDeduplicationKey(alertSource, eventData);

    let response;
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { apiUrl, graphqlUrl, serverUrl, ...context } = github.context;

        response = await client.postJson<{
            deduplication_key?: string;
            message?: string;
            status?: string;
        }>(
            `${INCIDENT_IO_HTTP_URL}${alertSource.configurationId}`,
            {
                ...eventData,
                source_url: `${serverUrl}/${owner}/${repository}/actions/runs/${runId}/attempts/${runAttempt}`,
                metadata: {
                    ...eventData.metadata,

                    /**
                     * Add some additional metadata about the workflow run.
                     */
                    github_context: context,
                },
                deduplication_key: deduplicationKey,
            },
            {
                authorization: `Bearer ${alertSource.token}`,
            },
        );
    } catch (error) {
        if (!(error instanceof Error)) {
            debug(`Unknown error occurred while firing event: ${JSON.stringify(error)}`);

            throw new EventResponseError("Failed to fire event due to an unknown error.");
        }

        throw EventResponseError.requestFailed(error);
    }

    const { statusCode, result } = response;

    if (statusCode !== 202) {
        debug(`Response body: ${JSON.stringify(response.result)}`);
        throw EventResponseError.invalidStatusCode(response.statusCode);
    }

    if (result?.status !== "accepted") {
        debug(`Response body: ${JSON.stringify(response.result)}`);
        throw EventResponseError.invalidResponseStatus(response.result?.status);
    }

    if (!result?.deduplication_key) {
        debug(`Response body: ${JSON.stringify(response.result)}`);
        throw EventResponseError.missingDeduplicationKey();
    }

    return {
        deduplicationKey: result.deduplication_key,
        message: response.result?.message,
        status: result.status,
    };
};
