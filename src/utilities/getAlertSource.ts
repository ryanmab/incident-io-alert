import { getInput } from "@actions/core";
import { AlertSourceError } from "../errors/AlertSourceError.js";

export type AlertSource = {
    configurationId: string;
    token: string;
};

/**
 * Get the alert source configuration from the action inputs.
 *
 * @throws AlertSourceError
 */
export const getAlertSource = (): AlertSource => {
    try {
        const token = getInput("alert_source_token", { trimWhitespace: true, required: true });
        const configurationId = getInput("alert_source_id", { trimWhitespace: true, required: true });

        return {
            token,
            configurationId,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw AlertSourceError.invalidInput(error);
        }

        throw new AlertSourceError("An unknown error occurred while reading the alert source inputs.");
    }
};
