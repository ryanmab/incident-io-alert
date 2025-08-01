export class AlertSourceError extends Error {
    static invalidInput(error: Error) {
        return new AlertSourceError(`An error occurred while reading the alert source inputs. Error: ${error.message}`);
    }
}
