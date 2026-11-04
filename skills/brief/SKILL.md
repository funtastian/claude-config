---
name: brief
description: Turn a rough idea or vague request into a tight brief (goal, context, constraints, done-when) before any work starts. Use when the user types /brief, or dumps a half-formed idea and asks to shape it, sharpen it, or "make this a proper prompt".
---

# Brief

A **brief** is the smallest description that lets the work start without guessing: one goal, the context that matters, the constraints, and a checkable **done-when**.

## Steps

1. **Gather.** Take everything the user gave. Look up what you can yourself: the repo, its `CLAUDE.md`/`BACKLOG.md`, related files, earlier messages. Facts are your job; decisions are the user's.
   *Done when:* every fact you could find by looking is found.

2. **Draft the brief** in this shape:

   ```
   Goal:        <one sentence: the outcome, not the activity>
   Context:     <who/what it's for, where it lives, what exists already>
   Constraints: <must / must-not: stack, budget, time, style, scope limits>
   Done when:   <observable checks: a command passes, a page shows X, a file exists>
   Out of scope: <what this deliberately leaves for later>
   ```

   Mark every field you couldn't fill from facts as a **gap**.
   *Done when:* each field is filled or marked as a gap, and **Done when** is something a person or a command can check. "Works well" doesn't count; "`npm test` passes and the form saves a row" does.

3. **Close the gaps in one round.** Ask only about gaps that change what gets built, all at once and numbered, each with your recommended answer, worded so "yes" accepts it. Fill the minor gaps with sensible defaults and label them *assumed*.
   *Done when:* the user has answered, or every remaining gap is labelled *assumed*.

4. **Hand off.** Show the final brief (15 lines at most) and offer the next move that fits:
   - small and clear → "Start now?"
   - a new feature or project → grilling, then `backlog-planner`
   - just an idea for later → capture it in `claude-home/IDEAS.md`

   For multi-step work, the **Done when** line becomes the `/goal` condition.
