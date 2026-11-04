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
