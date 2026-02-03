# Action Relay (Clipboard -> HTTPS -> Notion OS)

This repo provides a Docker-only action client and an optional Windows hotkey wrapper for sending JSON intent packets.

Docker-only note: when the client runs inside a container, `ACTION_BASE_URL` must point to a reachable host address. Use `host.docker.internal` when targeting a service on the host, or a public hostname/IP when the intent normaliser is on another machine.

## Setup

1) Copy the environment template:

```powershell
Copy-Item .env.example .env
```

2) Edit `.env` with your real values.

## Run the client manually

stdin mode:

```powershell
Get-Content .\docs\examples\example_intent.json | docker compose run --rm -T action-client run --stdin
```

file mode:

```powershell
docker compose run --rm action-client run --file docs/examples/example_intent.json
```

To avoid network calls, set `DRY_RUN=1` in `.env`.

## Run tests

```powershell
docker compose run --rm test smoke
```

## Windows hotkey (AutoHotkey v2, optional)

This is a host convenience and not part of the canonical docker-only workflow.

1) Install AutoHotkey v2: https://www.autohotkey.com/
2) Double-click `windows\run_action.ahk` to run it.
3) Copy a JSON intent packet to the clipboard.
4) Press Ctrl+Shift+Enter to run it through the container.

Success or failure is shown as a notification and the response is copied back to the clipboard.
