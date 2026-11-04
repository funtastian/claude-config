#!/usr/bin/env node
// PreToolUse guard for Bash and PowerShell tool calls (cross-platform port of guard.ps1).
// - Catastrophic commands (wiping a drive, home folder, everything) are denied outright.
// - Risky-but-sometimes-legit commands (push to main, force push, hard reset) make Claude ask first.
// Anything else passes through untouched. Any error → pass through (exit 0, no output).

const dangerTarget = String.raw`(\s|=|^)("|')?(/|~|~/|\$HOME|\$env:USERPROFILE|\$env:HOMEDRIVE|\*|\.|\.\.|[A-Za-z]:\\?|[A-Za-z]:/|/c/?|/\*)("|')?(\s|;|&|\||$)`;
const R = (s) => new RegExp(s, 'i'); // PowerShell -match is case-insensitive

const deny = [
  [R(String.raw`\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|-r\s+-f|-f\s+-r|--recursive\s+--force|--force\s+--recursive)\b.*` + dangerTarget), 'Recursive force delete of a root, home or wildcard path'],
  [R(String.raw`\bRemove-Item\b(?=.*-Recurse)(?=.*-Force).*` + dangerTarget), 'Recursive force Remove-Item of a root, home or wildcard path'],
  [R(String.raw`\b(rd|rmdir)\s+/s\b.*\s[A-Za-z]:\\?(\s|$)`), 'Recursive delete of a drive root'],
  [R(String.raw`(^|[;&|]\s*)format(\.com)?\s+[A-Za-z]:|\b(Format-Volume|Clear-Disk|Initialize-Disk)\b|(^|[;&|]\s*)diskpart\b`), 'Disk formatting / partitioning'],
  [R(String.raw`\bmkfs(\.\w+)?\b|\bdd\s+.*of=/dev/`), 'Overwriting a disk device'],
  [R(String.raw`:\(\)\s*\{\s*:\|:&\s*\};:`), 'Fork bomb'],
];

const ask = [
  [R(String.raw`\bgit\s+push\b.*\s(--force|-f)(\s|$)`), 'Force push rewrites remote history (use --force-with-lease if you must)'],
  [R(String.raw`\bgit\s+push\b.*\b(main|master)\b`), 'Pushing directly to main/master'],
  [R(String.raw`\bgit\s+reset\s+--hard\b`), 'git reset --hard discards uncommitted work'],
  [R(String.raw`\bgit\s+clean\s+-[a-zA-Z]*f`), 'git clean -f permanently deletes untracked files'],
  // Case-sensitive on purpose: -D force-deletes, lowercase -d is the safe delete.
  [new RegExp(String.raw`\bgit\s+branch\s+-D\b`), 'Force-deleting a branch'],
  [R(String.raw`\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)`), 'Discarding all local changes'],
];

function respond(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
  }));
}

let raw = '';
process.stdin.on('data', (d) => (raw += d)).on('end', () => {
  try {
    const cmd = String(JSON.parse(raw)?.tool_input?.command ?? '');
    if (!cmd.trim()) return;
    for (const [re, why] of deny) if (re.test(cmd)) return respond('deny', `Blocked by guard hook: ${why}. If you really mean it, run it yourself.`);
    for (const [re, why] of ask) if (re.test(cmd)) return respond('ask', `Guard hook: ${why}.`);
  } catch {}
});
