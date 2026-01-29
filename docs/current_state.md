# action_relay — Current State (Authoritative for this repo)

## What works today
- Docker-only action client supports stdin/file modes
- Optional AutoHotkey wrapper for Windows clipboard workflow
- DRY_RUN support
- Docker-run smoke tests

## Phase 1 role (exact)
For Phase 1, action_relay must provide a reliable way to submit an intent packet to intent_normaliser and surface the response.
In scope:
- Example payloads that match notion_assistant_contracts schemas
- Clear instructions for pointing `ACTION_BASE_URL` at the intent_normaliser service
- Smoke tests that validate: submit → receive HTTP 200 + parse JSON

## Phase 1 scope (exact)

Goal: a single end-to-end vertical slice that reliably turns a natural-language intent into a Notion Task create/update, with an audit trail.

In scope:
- Submit intent (via action_relay client or curl) to intent_normaliser `POST /v1/intents`.
- intent_normaliser normalises into a deterministic plan (`notion.tasks.create` or `notion.tasks.update`).
- If `EXECUTE_ACTIONS=true` and confidence >= threshold, intent_normaliser executes the plan by calling notion_gateway:
  - `POST /v1/notion/tasks/create` or `POST /v1/notion/tasks/update`
- Write artifacts for: received → normalised → executed (or failed) with stable IDs.
- Idempotency: duplicate submissions with the same `request_id` (or generated deterministic key) must not create duplicate Notion tasks.
- Error handling: gateway errors are surfaced in the response and recorded as artifacts.
- Minimal context lookups:
  - Optional: query context_api for project/task hints when provided, but Phase 1 must still work without context_api being “perfect”.

Out of scope (Phase 2+):
- UI for clarifications (API-only is fine).
- Calendar events / reminders.
- Full automated background sync from Notion.
- Multi-user, permissions, or “agents” beyond single operator.


## Verification commands
- Tests (Docker):
  - `docker compose run --rm test smoke`
