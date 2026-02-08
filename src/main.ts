import { debug, info, setFailed, setOutput } from "@actions/core";
import { getAlertSource, fireEvent, getEventData } from "@utilities";

export const run = async () => {
    try {
        const alertSource = getAlertSource();
        const eventData = getEventData();

        const { deduplicationKey, message, status } = await fireEvent(alertSource, eventData);

        debug(`Deduplication key: ${deduplicationKey}`);
        debug(`Message: ${message}`);

        switch (eventData.status) {
            case "firing":
                info("Alert fired successfully.");
                break;
            case "resolved":
                info("Alert resolved successfully.");
                break;
        }

        /**
         * Set some handy outputs for any downstream steps to consume.
         */
        setOutput("deduplication_key", deduplicationKey);
        setOutput("status", status);
    } catch (error) {
        setOutput("status", "failure");
        if (error instanceof Error) setFailed(error.message);
    }
};
