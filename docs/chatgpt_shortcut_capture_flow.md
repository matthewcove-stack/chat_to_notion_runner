# ChatGPT -> Shortcut -> Brain OS (MVP Capture Flow)

Status: draft (MVP)  
Last updated: 2026-02-03

## Purpose
Document the user-facing capture workflow:
- Create a light intent packet in ChatGPT
- Copy/paste into a Shortcut (or equivalent)
- Send to the canonical ingest endpoint
- Receive a receipt and keep it for trust/debug

This flow is the primary "daily use" capture path for MVP.

## What this flow is (and is not)
- IS: explicit, user-triggered capture with auditability.
- IS NOT: background automation or autonomous execution without a receipt.

## Step-by-step
1) In ChatGPT, ask for an Intent Packet JSON (lightweight).
2) Copy the JSON block to clipboard.
3) Run the Shortcut:
   - It reads clipboard text
   - Validates "looks like JSON"
   - POSTs to intent_normaliser /v1/intents
4) Shortcut displays:
   - receipt_id
   - status
   - trace_id
   - error (if any)

## Shortcut minimum rules (MVP)
- If clipboard is not valid JSON:
  - Do not send
  - Show an error and keep clipboard intact
- On HTTP failure/timeouts:
  - Show failure
  - Allow retry (manual retry is fine for MVP)
- On success (200):
  - Show receipt_id and status
  - Optionally copy receipt_id back to clipboard

## Payload conventions for ChatGPT
- Output MUST be a single JSON object in one code block.
- It MUST include:
  - kind: "intent"
  - natural_language: "...user text..."
- It SHOULD include:
  - schema_version: "v1"
  - source: "chatgpt"
  - timestamp: ISO-8601 UTC

ChatGPT MUST NOT output:
- Notion API calls
- tool instructions
- execution plans

## Target endpoint
- POST {INTENT_NORMALISER_BASE_URL}/v1/intents
- Authorization: bearer token (as already implemented in your stack)

## Why action_relay still exists
action_relay remains useful for:
- Windows/terminal capture testing
- repeatable smoke tests
- developer workflows

But the MVP phone-first capture is Shortcut -> HTTP.

## Troubleshooting
- If you get 401/403: check bearer token configuration.
- If you get 400: the JSON is malformed or schema_version unsupported.
- If you get 500: check intent_normaliser logs using trace_id.
