# UC01 - Task Capture (action_relay)

UC01 is the Phase 1 vertical slice: natural language -> Notion task (create/update).

## Purpose
`action_relay` provides a simple client for submitting intent packets to `intent_normaliser`.

In Phase 1, it is used to:
- send a `kind: "intent"` JSON packet to `POST /v1/intents`
- verify that the system returns a stable Notion task id

## CLI usage
The Node CLI is in `client/src/cli.js` and is exposed via npm scripts.

Environment variables:
- `ACTION_BASE_URL`: base URL of `intent_normaliser` (for example `http://localhost:8000`)
- `ACTION_BEARER_TOKEN`: bearer token that matches `INTENT_SERVICE_TOKEN` in `intent_normaliser`

Send an intent via stdin:

```bash
export ACTION_BASE_URL=http://localhost:8000
export ACTION_BEARER_TOKEN=change-me

cat <<'JSON' | action-client run --stdin
{
  "kind": "intent",
  "intent_type": "create_task",
  "request_id": "2f4cf4c1-7b79-4d24-9bfa-1e2a4b4d6f3e",
  "natural_language": "Create a task: Order hinges tomorrow",
  "fields": {
    "title": "Order hinges",
    "due": "2026-02-04",
    "notes": "Blum full overlay"
  }
}
JSON
```

Send an intent via file:

```bash
action-client run --file ./examples/uc01_create_task.json
```

## Expected response
A successful Phase 1 execution returns JSON that includes:
- `details.request_id`
- `details.notion_task_id`

Idempotency check:
- re-running the exact same payload with the same `request_id` should return the same `details.notion_task_id`.
