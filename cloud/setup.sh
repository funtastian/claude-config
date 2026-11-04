#!/usr/bin/env bash
# Installs the portable Claude config into a cloud (Claude Code on the web) session.
# Idempotent and fail-soft: a failed download never blocks the session from starting.
set -u
BASE="https://raw.githubusercontent.com/funtastian/claude-config/main"
mkdir -p "$HOME/.claude"
if curl -fsSL "$BASE/global/CLAUDE.md" -o "$HOME/.claude/CLAUDE.md.tmp"; then
  mv "$HOME/.claude/CLAUDE.md.tmp" "$HOME/.claude/CLAUDE.md"
  echo "claude-config: installed ~/.claude/CLAUDE.md"
else
  rm -f "$HOME/.claude/CLAUDE.md.tmp"
  echo "claude-config: download failed, continuing without global rules" >&2
fi
exit 0
