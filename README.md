# :fire: Incident.io Alert
![coverage](https://api.coveragerobot.com/v1/graph/github/ryanmab/incident-io-alert/badge.svg?token=6e335c944dfc08a69651cc42f5d89945bed32f8da4d0e1a897)

A community maintained GitHub Action for triggering Incident.io alerts from GitHub workflows.

## Usage

### Setup

As with any alert in Incident.io, they come from an alert source.

In this particular instance, there is no integration designed for GitHub Actions, so this action makes use of the native HTTP Alert Events source.

#### Creating an Alert Source

1. Go to your Incident.io workspace.
2. Navigate to `Alerts` > `Configuration` > `Create New`.
3. Choose the `HTTP` alert source.
4. Enter a name for the alert source (e.g. your GitHub repository name).
5. Choose the type of source as **Default**, and hit **Continue**.

#### Configuring the GitHub Action

In order to allow the GitHub Action to trigger events, you need to take the Bearer token generated for the alert source, and the ID of the
alert source configuration, and set them as inputs in the GitHub Action.

**Bearer Token**: This is a sensitive value, so it should be stored as a GitHub secret. It can be found when setting up the source, inside the `Header` value. It should look like `Bearer <token here>`.

**Alert Source ID**: This is the ID of the alert source configuration, which can be found at the end of the URL when setting up the source. It should look like `https://api.incident.io/v2/alert_events/http/<id here>`

### Inputs

- `alert_source_id` - The ID of the alert source configuration (**Required**).
- `alert_source_token` - The API token to authenticate the request against the alert source (**Required**).
- `title` - The title of the alert (**Required**).
- `description` - The description of the alert (**Required**).
- `status` - The status of the alert (**Optional**, **Options:** `firing` or `resolved`, **Default:** `firing`).
- `deduplication_key` - A deduplication key to prevent duplicate alerts (**Optional**, **Default:** a unique hash based on the workflow context).
- `metadata` - Additional metadata to include with the alert in JSON format (**Optional**).

### Example

```yaml
- uses: ryanmab/incident-io-alert@v1
  with:
    alert_source_id: ${{ secrets.ALERT_SOURCE_ID }}
    alert_source_token: ${{ secrets.ALERT_SOURCE_TOKEN }}
    title: "Test Event"
    status: firing
    description: |
        # Test Event

        This is a test event. With multiple lines.
    metadata: |
        {
            "key": "value",
            "another_key": "another_value"
        }
```