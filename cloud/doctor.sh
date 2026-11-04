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
timeout 60 claude plugin list 2>&1 | grep -oE "[A-Za-z0-9._-]+@[A-Za-z0-9._-]+|Status: .*" | paste - - | sed 's/  */ /g; s/^/  /' || echo "  (plugin list failed)"

echo "== user skills dir"
ls "$C/skills" 2>/dev/null | sed 's/^/  /' || echo "  (none)"

echo "== git in this session"
echo "  user $(id -un), repo owner $(stat -c %U "$PWD" 2>/dev/null)"
git -C "$PWD" branch --show-current 2>&1 | head -2 | sed "s/^/  branch: /"
git -C "$PWD" rev-parse --short HEAD 2>&1 | head -2 | sed "s/^/  HEAD: /"

echo "== hook scripts run directly"
SC=$(printf '{"cwd":"%s"}' "$PWD" | node "$C/hooks/session-context.js" 2>&1)
[ -n "$SC" ] && ok "session-context.js prints: $(echo "$SC" | sed -n 2p)" || bad "session-context.js printed nothing for cwd $PWD"
G=$(printf '{"tool_input":{"command":"git push --force"}}' | node "$C/hooks/guard.js" 2>&1)
echo "$G" | grep -q '"ask"' && ok "guard.js asks on force push" || bad "guard.js: ${G:-no output}"
T0=$(date +%s); PC=$(printf '{"prompt":"make it better","transcript_path":""}' | node "$C/hooks/prompt-check.js" 2>&1)
[ -n "$PC" ] && ok "prompt-check.js nudges on 'make it better' ($(( $(date +%s) - T0 ))s)" || bad "prompt-check.js printed nothing ($(( $(date +%s) - T0 ))s): nested claude -p may not work here"

echo "== hooks inside a real nested session (debug log)"
L=$(mktemp); timeout 120 claude -p "reply ok" --model haiku --no-session-persistence --debug-file "$L" >/dev/null 2>&1
echo "  nested claude exit: $?"
grep -E "Hooks: .*finished with status|provided additionalContext" "$L" | sed -E 's/^[^ ]+ \[DEBUG\] //' | cut -c1-170 | sed 's/^/  /' | head -14
grep -ciE "hook" "$L" | sed 's/^/  hook-related debug lines: /'
grep -iE "hooks? (disabled|skipped|not allowed)|allowManagedHooksOnly|disableAllHooks|untrusted" "$L" | head -5 | cut -c1-200 | sed 's/^/  NOTE /'
rm -f "$L"
exit 0
