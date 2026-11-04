#!/usr/bin/env bash
# Installs the portable Claude config into a cloud (Claude Code on the web) session:
# global rules, cross-platform hooks, and user-level settings that wire the hooks up.
# Idempotent and fail-soft: a failed download never blocks the session from starting.
set -u
BASE="https://raw.githubusercontent.com/funtastian/claude-config/${CLAUDE_CONFIG_REF:-main}"
C="$HOME/.claude"
mkdir -p "$C/hooks"

fetch() { # fetch <repo path> <dest>: atomic, keeps the old file on failure
  if curl -fsSL "$BASE/$1" -o "$2.tmp"; then mv "$2.tmp" "$2"; echo "claude-config: installed $2"
  else rm -f "$2.tmp"; echo "claude-config: could not fetch $1, continuing" >&2; fi
}

fetch global/CLAUDE.md          "$C/CLAUDE.md"
fetch hooks/guard.js            "$C/hooks/guard.js"
fetch hooks/session-context.js  "$C/hooks/session-context.js"
fetch hooks/prompt-check.js     "$C/hooks/prompt-check.js"
fetch cloud/settings.json       "$C/settings.json"
exit 0
