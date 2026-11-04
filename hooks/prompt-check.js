#!/usr/bin/env node
// UserPromptSubmit hook (cloud/phone sessions only): asks Haiku whether the prompt is
// too vague to act on. If so, it adds a one-line hint to Claude's context. It never
// blocks the prompt. Fail-soft: any error, timeout or doubt → no output.
const { spawnSync } = require('child_process');
const fs = require('fs');

const SYSTEM = [
  'You check whether a request to a coding/assistant agent is specified well enough to act on.',
  'You get the agent\'s previous message (may be empty) and the user\'s new message.',
  'A message is fine if, together with the previous message, the goal is clear and the agent could tell when it is done.',
  'Short replies to a question the agent asked (yes, go, option 2, a name) are fine.',
  'Reply with exactly OK if fine. Otherwise reply with one short line naming what is missing (e.g. "unclear what \'it\' refers to; no done condition").',
].join(' ');

function lastAssistantText(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const e = JSON.parse(lines[i]);
      if (e.type !== 'assistant') continue;
      const c = e.message?.content;
      const text = Array.isArray(c) ? c.filter((p) => p.type === 'text').map((p) => p.text).join('\n') : String(c ?? '');
      if (text.trim()) return text.slice(-1500);
    }
  } catch {}
  return '';
}

function main(raw) {
  if (process.env.PROMPT_CHECK_CHILD) return; // never recurse into ourselves
  if (process.env.CLAUDE_CODE_REMOTE !== 'true' && !process.env.PROMPT_CHECK_FORCE) return;
  const input = JSON.parse(raw);
  const prompt = String(input.prompt ?? '').trim();
  const words = prompt.split(/\s+/).filter(Boolean).length;
  // Pre-checks: skip only what never needs a model to judge.
  if (!prompt || prompt.startsWith('/') || words > 60) return;
  if (/^(y|yes|no|ok|okay|go|go ahead|continue|do it|sure|thanks|thank you|next|done|stop|\d+)[.!]?$/i.test(prompt)) return;

  const prev = lastAssistantText(input.transcript_path);
  const user = `PREVIOUS AGENT MESSAGE:\n${prev || '(none)'}\n\nUSER MESSAGE:\n${prompt}`;
  const r = spawnSync('claude', [
    '-p', '--model', 'haiku', '--system-prompt', SYSTEM, '--tools', '',
    '--setting-sources', '', '--strict-mcp-config', '--disable-slash-commands', '--no-session-persistence',
  ], {
    input: user, encoding: 'utf8', timeout: 25000,
    cwd: require('os').tmpdir(), env: { ...process.env, PROMPT_CHECK_CHILD: '1' },
  });
  const verdict = (r.stdout || '').trim().split('\n')[0].trim();
  if (r.status !== 0 || !verdict || /^ok\b/i.test(verdict) || verdict.length > 200) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: `Prompt check (Haiku): ${verdict}. If this gap changes what you'd do, ask one round of questions with recommended answers (4D Description rule); otherwise proceed and state your assumption.`,
    },
  }));
}

let raw = '';
process.stdin.on('data', (d) => (raw += d)).on('end', () => { try { main(raw); } catch {} });
