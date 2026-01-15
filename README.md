# Action Runner (Clipboard -> HTTPS -> Notion OS)

This repo provides a Docker-only action client and a Windows hotkey wrapper for running JSON action packets.

## Setup

1) Copy the environment template:

```powershell
Copy-Item .env.example .env
```

2) Edit `.env` with your real values.

## Run the client manually

stdin mode:

```powershell
Get-Content .\docs\examples\example_action.json | docker compose run --rm -T action-client run --stdin
```

file mode:

```powershell
docker compose run --rm action-client run --file docs/examples/example_action.json
```

To avoid network calls, set `DRY_RUN=1` in `.env`.

## Run tests

```powershell
docker compose run --rm test smoke
```

## Windows hotkey (AutoHotkey v2)

1) Install AutoHotkey v2: https://www.autohotkey.com/
2) Double-click `windows\run_action.ahk` to run it.
3) Copy a JSON action packet to the clipboard.
4) Press Ctrl+Shift+Enter to run it through the container.

Success or failure is shown as a notification and the response is copied back to the clipboard.