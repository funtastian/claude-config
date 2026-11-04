#!/usr/bin/env bash
# Reports what the portable config actually delivered in this (cloud) session.
# Read-only. Usage: curl -fsSL https://raw.githubusercontent.com/funtastian/claude-config/main/cloud/doctor.sh | bash
BASE="https://raw.githubusercontent.com/funtastian/claude-config/main"
C="$HOME/.claude"
ok()  { echo "  OK   $*"; }
bad() { echo "  MISS $*"; }

echo "== environment"
echo "  CLAUDE_CODE_REMOTE=${CLAUDE_CODE_REMOTE:-unset}  claude $(claude --version 2>/dev/null | head -1)  node $(node --version 2>/dev/null)"

echo "== global rules"
if [ -f "$C/CLAUDE.md" ]; then
  if curl -fsSL "$BASE/global/CLAUDE.md" 2>/dev/null | diff -q - "$C/CLAUDE.md" >/dev/null; then ok "~/.claude/CLAUDE.md is current"
  else bad "~/.claude/CLAUDE.md is stale (refresh-rules hook or setup-script bump fixes it)"; fi
else bad "~/.claude/CLAUDE.md missing (setup script not run?)"; fi

echo "== hooks"
for h in guard.js session-context.js prompt-check.js; do [ -f "$C/hooks/$h" ] && ok "$h" || bad "$h"; done
if [ -f "$C/settings.json" ]; then
  echo "  settings.json hook events: $(node -e 'try{console.log(Object.keys(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).hooks||{}).join(", "))}catch(e){console.log("unreadable")}' "$C/settings.json")"
else bad "~/.claude/settings.json"; fi

echo "== plugins (claude plugin list)"
timeout 60 claude plugin list 2>&1 | grep -E "❯|Status" | paste - - | sed 's/  */ /g' | sed 's/^/ /' || echo "  (plugin list failed)"

echo "== user skills dir"
ls "$C/skills" 2>/dev/null | sed 's/^/  /' || echo "  (none)"
exit 0
