# Intent: Action Relay

## Overview

Provide a Docker-only action client that forwards JSON intent packets to the intent normaliser.
The optional Windows hotkey wrapper is a convenience, not part of the canonical workflow.

## Responsibilities

- Accept intent packets via stdin or file input.
- Validate minimal packet shape (kind = "intent").
- POST to `/v1/intents` with bearer auth.
- Support `DRY_RUN` output for offline verification.

## Constraints

- Docker-only for the core client and tests.
- No host-installed dependencies required for the canonical workflow.
- Use Docker service names (not localhost) for container-to-container calls.
- Stateless; no local persistence.

## Interface

CLI:

- `action-client run --stdin`
- `action-client run --file <path>`

Env:

- `ACTION_BASE_URL` (required)
- `ACTION_BEARER_TOKEN` (required)
- `ACTION_TIMEOUT_SECONDS` (optional)
- `DRY_RUN` (optional)

## Non-Goals

- Not a server.
- No intent normalisation or orchestration.
- No local automation beyond optional host hotkey tooling.
