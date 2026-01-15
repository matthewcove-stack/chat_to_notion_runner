# Action Packet Contract

The client accepts a single JSON object with these fields:

- endpoint (string, required, must start with `/v1/`)
- request_id (string, required)
- idempotency_key (string, optional)
- actor (object, optional)
- payload (object, required)

Example:

```json
{
  "endpoint": "/v1/actions/run",
  "request_id": "req_12345",
  "idempotency_key": "idem_12345",
  "actor": {
    "type": "user",
    "id": "user_123"
  },
  "payload": {
    "action": "notion.create",
    "data": {
      "title": "Example Action",
      "content": "This is a sample payload."
    }
  }
}
```