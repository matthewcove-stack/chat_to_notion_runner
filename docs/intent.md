# action_relay — Intent

action_relay is the operator convenience layer:
- provides a docker-only client that sends JSON intent packets over HTTPS
- optionally provides a Windows hotkey wrapper for clipboard → send → response copied back

Primary goal: make it effortless to submit intents into Brain OS (typically to intent_normaliser).
See repo `INTENT.md` for canonical spec. This doc aligns with Brain OS gold-standard docs.
