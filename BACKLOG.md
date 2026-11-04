# Backlog: portable Claude setup

MVP: a session started from the phone loads the same global rules as the PC, from one source of truth.

- [ ] B1 Portable global rules (MVP): `global/CLAUDE.md` imported on the PC and installed by `cloud/setup.sh`. Done when: a fresh phone cloud session quotes a rule, and `/memory` on the PC shows the import.
- [ ] B1a Recommend + offer to implement: rule in `global/CLAUDE.md` (skills/hooks/MCP/agents/plugins/settings → one-line recommendation + concrete offer). Done when: a repeated manual step makes Claude offer a matching hook or skill with a ready-to-run implementation.
- [x] B2 Ideas inbox: private `claude-home` repo with `IDEAS.md` + CLAUDE.md (capture → grill → promote to own repo); default repo for phone sessions. Done when: a phone session adds an idea and pushes it. Also ships `.claude/hooks/refresh-rules.js` (SessionStart, cloud-only): refreshes stale snapshot rules and injects them only when they changed. Pending: phone test.
- [x] B3 Cross-platform hooks: port `guard.ps1` and `session-context.ps1` to Node (exec form, `$CLAUDE_CODE_REMOTE`), in `hooks/`; setup script writes a cloud `~/.claude/settings.json` including the ExitPlanMode backlog hook. Done when: both hooks fire on the PC and in the cloud. Verified: guard parity 29/29 with the PS original (plus fix: lowercase `git branch -d` no longer asks), session-context identical output, both fire in a PC session. Pending: confirm in a phone cloud session.
- [x] B4 4D rules: short Delegation/Description/Discernment/Diligence section in `global/CLAUDE.md`. Done when: in the file, under 25 lines. 17 lines. Verified: "make it better" → one round of questions with recommended answers; clear prompt answered directly.
- [ ] B5 Prompt helpers: `/brief` skill on the account + Haiku prompt-type `UserPromptSubmit` nudge for vague prompts (PC + cloud). Done when: "make it better" gets one clarifying question; "run the tests" gets no nudge.
  - [x] B5a `/brief` skill in `skills/brief/` (tested: rough idea → brief + one round of gap questions + next move). Pending: upload `dist/brief.zip` on claude.ai.
  - [ ] B5b Haiku nudge hook: on hold. B4 rules already handle vague prompts; decide after using /brief.
- [ ] B6 Subagents on Sonnet: `env.CLAUDE_CODE_SUBAGENT_MODEL=sonnet` (no FORCE) on PC + cloud. Done when: an Explore run shows Sonnet.
- [ ] B7 Prune duplicates + verify sync: `/skill-doctor`, `claude plugin details`; one skill per job; check context7, pr-review-toolkit, frontend-design, security-guidance load. Done when: one skill per job, round-2 plugins visible.
- [ ] B8 Plugins in the cloud: test whether account plugins load in cloud sessions; if not, the setup script installs the key ones. Done when: documented here and working.
- [ ] B9 Remote Control: push notifications in `/config` + README section on `claude --remote-control` for local-only work. Done when: the phone drives a PC session.
- Later: cloud status line.
