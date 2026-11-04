#!/usr/bin/env node
// SessionStart hook: give Claude the project's git state and next backlog item
// (cross-platform port of session-context.ps1). Prints nothing outside git repos /
// projects without BACKLOG.md, and nothing on any error.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const git = (dir, args) => {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 });
  } catch { return null; }
};

let raw = '';
process.stdin.on('data', (d) => (raw += d)).on('end', () => {
  try {
    let dir = null;
    try { dir = JSON.parse(raw).cwd; } catch {}
    if (!dir) dir = process.cwd();
    const out = [];

    const branch = (git(dir, ['branch', '--show-current']) || '').trim();
    if (branch) {
      const status = (git(dir, ['status', '--short']) || '').split(/\r?\n/).filter(Boolean);
      const track = (git(dir, ['rev-list', '--left-right', '--count', '@{u}...HEAD']) || '').trim();
      let sync = '';
      if (track) {
        const [behind, ahead] = track.split(/\s+/).map(Number);
        if (ahead > 0 || behind > 0) sync = `, ahead ${ahead} / behind ${behind}`;
      }
      out.push(`Git: branch ${branch}, ${status.length} changed file(s)${sync}`);
      out.push(...status.slice(0, 8).map((s) => `  ${s}`));
      if (status.length > 8) out.push('  ...');
    }

    const backlog = path.join(dir, 'BACKLOG.md');
    if (fs.existsSync(backlog)) {
      const open = fs.readFileSync(backlog, 'utf8').split(/\r?\n/).filter((l) => /^\s*[-*] \[ \]/.test(l));
      if (open.length) {
        let next = open[0].replace(/^\s*[-*] \[ \]\s*/, '').trim();
        if (next.length > 220) next = next.slice(0, 220) + '...';
        out.push(`Backlog: ${open.length} open item(s). Next: ${next}`);
      } else {
        out.push('Backlog: no open items.');
      }
    }

    if (out.length) process.stdout.write(['Session context (from SessionStart hook):', ...out].join('\n') + '\n');
  } catch {}
});
