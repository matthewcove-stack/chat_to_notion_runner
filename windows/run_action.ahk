#Requires AutoHotkey v2.0

^+Enter::
{
    clip := A_Clipboard
    if (clip = "") {
        TrayTip("Action Relay", "Clipboard is empty.", 2000)
        return
    }

    shell := ComObject("WScript.Shell")
    exec := shell.Exec("docker compose run --rm -T action-client run --stdin")
    exec.StdIn.Write(clip)
    exec.StdIn.Close()

    stdout := exec.StdOut.ReadAll()
    stderr := exec.StdErr.ReadAll()
    exitCode := exec.ExitCode

    if (stdout != "") {
        A_Clipboard := stdout
    }

    if (exitCode = 0) {
        TrayTip("Action Relay", "Success. Response copied to clipboard.", 2000)
    } else {
        brief := stderr
        if (StrLen(brief) > 200) {
            brief := SubStr(brief, 1, 200) "..."
        }
        TrayTip("Action Relay", "Failed: " brief, 3000)
    }
}
