# claude-config

Portable, secret-free Claude Code config: one source of truth for the PC and for cloud sessions started from the phone (claude.ai/code).

## What's here
- `global/CLAUDE.md`: personal global rules. It sits in a subfolder so sessions *inside* this repo don't load it twice.
- `hooks/guard.js`: PreToolUse guard (denies catastrophic commands, asks before risky git).
- `hooks/session-context.js`: SessionStart git state + next BACKLOG item.
- `hooks/prompt-check.js`: cloud-only UserPromptSubmit check. Haiku flags vague prompts with a one-line hint and never blocks.
- `skills/brief/`: the `/brief` skill (uploaded to the claude.ai account, so it loads everywhere).
- `cloud/settings.json`: user-level settings for cloud sessions (the hooks above + the ExitPlanMode backlog check).
- `cloud/setup.sh`: cloud environment setup script. It installs all of the above into `~/.claude`.
- `cloud/doctor.sh`: read-only check of what a cloud session actually got (rules, hooks, plugins).

## How it's wired
- **PC:** `~/.claude/CLAUDE.md` contains one import line pointing at `global/CLAUDE.md` in this checkout, and `~/.claude/settings.json` runs the hooks straight from `hooks/`. Edit here, commit, push.
- **Cloud:** the claude.ai/code environment's setup script runs
  `curl -fsSL https://raw.githubusercontent.com/funtastian/claude-config/main/cloud/setup.sh | bash`
  and every new cloud session gets the latest pushed rules.

## Rule: no secrets
This repo is public. Tokens, keys and private paths go into environment variables or cloud network secrets, never here.

## Snapshot caveat
Cloud environments cache a filesystem snapshot after the setup script runs, so later sessions reuse the old `~/.claude/CLAUDE.md`. Repos that ship `refresh-rules.js` (see `claude-home/.claude/hooks/`) re-fetch the rules at every session start and inject them only when they changed. Elsewhere, edit the setup script (e.g. bump a `# v2` comment) to force a rebuild.

## Phone → PC (Remote Control)
Use this for local-only work the cloud can't reach (pi-music, the music drive, the Pi, non-GitHub folders). Claude runs **on the PC** with the full local setup, and the phone only shows the session.

1. On the PC, in the folder to work in (e.g. `Documents\projects`):
   `claude remote-control --name pc-projects`
   It's a small server: one session is ready immediately, and the phone can open more. Press `w` to switch between same-dir and worktree mode.
2. On the phone: Claude app → Code → pick **pc-projects**, or use claude.ai/code in a browser.
3. Reattach later: `claude remote-control --continue` (within about 4 h).

Requirements: the PC stays awake and the command keeps running. Push notifications are on (`agentPushNotifEnabled`), so the phone hears when Claude needs you. Inside a running interactive session, `/remote-control` turns it on for that session only.

**Which one to use:** an idea or anything on GitHub → cloud session (PC can be off). Something only the PC has → Remote Control.
