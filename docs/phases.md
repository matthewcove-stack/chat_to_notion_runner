# action_relay — Phases

## Phase 0 (done)
- Docker client and optional Windows wrapper
- Example intent packets
- Basic smoke tests

## Phase 1 (client role)
- Ensure example intent packets match contracts
- Ensure client can talk to intent_normaliser in docker compose reliably (no localhost footguns)
- Add a smoke test that calls a test endpoint in a running stack (optional) or validates request formation

## Phase 2 (later)
- Better operator UX (templates, shortcuts, logging)
- Multi-destination support (tasks, notes, calendar)
