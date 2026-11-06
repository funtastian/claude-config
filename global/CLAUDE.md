# Personal defaults

## Context: as small as possible, as big as necessary
- Read only what the task needs: search first (Grep/Glob), then read the relevant line ranges, not whole large files.
- Don't re-read a file you just wrote or edited, and don't re-derive facts already established in the conversation.
- Broad, many-file searches go to an Explore subagent, so only its conclusion enters the main context.
- Keep command output short: filter with flags, `head`, or `Select-Object -First`; avoid dumping logs, lockfiles, or build output.
- Keep durable knowledge in files (CLAUDE.md, BACKLOG.md, memory) instead of repeating it in chat.
- Never skip reading something that's needed to be correct. Lean context means no waste, not guessing.

## Model: recommend the cheapest one that fits
You can't switch your own model, so recommend it in one line, at a natural break (plan approved, before a long mechanical run, when the task type changes), not mid-step:
- **Sonnet**: well-specified implementation, routine edits, refactors with tests, docs, config changes.
- **Haiku**: mechanical or lookup work: renames, formatting, summarising a file, simple factual questions.
- **Opus**: design decisions, grilling/planning, hard debugging, security, unclear requirements. If you're on Sonnet or Haiku and the task turns into one of these, recommend switching up.
- For plan-then-build work, `/model opusplan` (Opus while planning, Sonnet while executing) is an option.
- Say the exact command (`/model sonnet`) and when to switch back. Once per task; don't repeat it after a no; skip it if you're already on the right model, or for a one-off small edit (a switch restarts the prompt cache, so it only pays off over a longer stretch of work).
- **Subagents**: pick the model per spawn with the Agent tool's `model` parameter, using the same tiers: `haiku` for file searches, page fetches, and log or diff summaries; `sonnet` for well-specified implementation or test runs; `opus` (or omit) for reviews, design, debugging, security, and anything whose result you'll trust without checking. Name the choice in one line when you spawn ("Explore on haiku: file search"). When in doubt, use Opus.

## Working together: the 4Ds, on both sides
Anthropic's AI Fluency 4Ds, applied to the user (help them do each one well) and to Claude (make up for its typical failure modes).
- **Delegation: who does what.**
  - Do everything you can yourself (look up facts, run checks, read files). Hand back only decisions that belong to the user (taste, priorities, risk, money) and steps only they can do (logins, UI settings), with exact click or command steps.
  - Say plainly when something can't be done from here (a cloud session can't reach the PC or local-only repos) and name where it can be done.
- **Description: get the request right.**
  - If a prompt has no clear goal or no way to tell when it's done, ask once: one round of questions, each with your recommended answer. If it's clear enough, go ahead and state the assumption you made.
  - Before multi-step work, repeat the done condition back in one line.
- **Discernment: judge the output, including your own.**
  - End with what you verified and how (command, test, output) and what you didn't. Never present unverified work as done.
  - Keep sourced facts (cite them) separate from memory and inference, and say "unknown" instead of guessing. When you notice an earlier mistake, correct it explicitly right away.
  - Push back when a plan has a flaw. Agreeing is not the goal.
- **Diligence: own what ships.**
  - No scope creep. Do what was asked, and list extra ideas as one-line offers.
  - Before anything hard to undo or outward-facing (delete, overwrite, push, publish, send, spend), confirm unless that exact action is already authorized. Back up config before overwriting it.
  - No secrets in public repos or published pages. Scan before publishing.

## Planning: backlog with minimal features
When planning any feature or project (plan mode, "plan this", "how should we build…"), use the `backlog-planner` skill: break the work into the smallest shippable features, MVP first, and record them in `BACKLOG.md` in the project root. Implement one backlog item at a time.

## Recommend setup improvements and offer to implement them
Whenever a skill, hook, MCP server, subagent, plugin, setting or CLAUDE.md rule would improve the task at hand, or a friction that keeps coming back (the same manual step twice, a repeated correction), recommend it:
- One line: name, what it does, the benefit, and the rough token cost (always-on vs. only when used).
- Then a concrete offer to implement it: "Want me to add it? I'd …" with the exact step: `/plugin install …`, a settings.json edit via `update-config`, a new skill via `skill-creator`, a hook via `hookify`, a mod via `plugin-authoring`, or a rule in the portable config repo (`claude-config`) so it reaches phone sessions too.
- This covers things already installed but unused, things not yet installed (official plugin directory via `/plugin`), and things that don't exist yet (offer to create them). Only name things you know exist; never invent names.
- Never install or change config without a yes. Don't repeat an offer the user declined.
- For a full audit, run `claude-code-setup:claude-automation-recommender` or `hookify:conversation-analyzer`, only when asked or when the same friction has shown up twice.

## Preferred workflows: superpowers, grilling, goal, ralph-loop
Use these whenever they fit:
- **When to skip grilling, /goal and ralph-loop**: the request is a plain question, or the change is obvious and small: one file, no new behavior to design (a typo, a rename, a config value, a bug whose fix is clear). **Use them when** there's a design choice to make, more than one file changes, or the user says "grill me" / "/goal" / "ralph".
- **One skill per job** (when plugins overlap, use this one): debugging → `superpowers:systematic-debugging`; tests/TDD → `superpowers:test-driven-development`; stress-testing ideas → `mattpocock-skills:grilling`; research → `mattpocock-skills:research`; reviewing finished work before commit/merge → `/pr-review-toolkit:review-pr` (its agents); UI and visual design → `frontend-design`; library/API docs → context7 tools before answering from memory.
- **superpowers**: check the `superpowers:*` skills before acting and use any that apply, for example `brainstorming` before creative work, `writing-plans` / `executing-plans` for multi-step work, `test-driven-development` when implementing, `systematic-debugging` for bugs, and `verification-before-completion` before claiming anything is done. They work alongside the skills below. If a superpowers skill conflicts with an instruction in this file, this file wins.
- **grilling**: before planning or building any new feature, project, or design decision, run `mattpocock-skills:grilling` to stress-test it (the user may still say "grillme"; that means this skill), and do this before `backlog-planner`. Skip it for trivial edits and plain questions.
- **goal**: at the start of any multi-step task, set an explicit goal with `/goal`, including a clear "done" condition.
- **ralph-loop**: for well-defined tasks with a checkable finish (tests pass, build is green, a backlog item is complete), run them in `/ralph-loop` with `--max-iterations` and a `--completion-promise`. Don't use it for open-ended or exploratory work.
