# Decision log

One row per real decision. Record the options I considered, not just the one I picked.
This is the evidence for the report's Methodology & Design section ("alternatives considered and
rejected") and for explaining decisions unprompted in the viva.

| Date | Decision | Options considered | Reason | Consequence |
|---|---|---|---|---|
| 2026-11-12 | Build the tutor on top of iLearn | Build on iLearn · new stack from scratch · extend an existing coding platform | iLearn already has the learner shell, progress, dashboard and accessibility work, so project time goes on the tutoring parts | Must separate prior work from project work clearly (baseline tag, PRIOR-WORK.md) |
| 2026-11-12 | Python first, Java as a Should requirement | Both as Musts · Python first · Java first | Python can run in the browser (Pyodide); Java needs a server sandbox | Java scope to confirm with Joe |
| 2026-11-19 | Project work on a `cs3ip` branch in the iLearn repo | Branch in the same repo · separate repo/fork | One history makes `git diff baseline-pre-cs3ip..cs3ip` show exactly what's new; `main` stays the live Confident Computing course | Never merge `cs3ip` into `main` while the client course is live |
| 2026-11-19 | Baseline = commit `bf63f84` (29 Aug 2026), tagged `baseline-pre-cs3ip` | Tag latest `main` · tag an earlier commit | Last commit before any CS3IP work | Everything after this tag is claimed as project work |
| | | | | |
