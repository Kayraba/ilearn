# Prior work: iLearn before CS3IP

**Baseline:** git tag `baseline-pre-cs3ip` → commit `bf63f84` ("Rewrite README in plainer first person").
Everything at or before that commit existed before the project and is **not** claimed as project work.
Compare any later state with: `git diff baseline-pre-cs3ip..cs3ip`.

## What iLearn already did at the baseline

- Static browser app (plain JavaScript ES modules, HTML, CSS; no framework, no build step), hosted on Render.
- One course, *Confident Computing*: 16 lessons, 240 activities of three types (`pick`, `type`, `practice`).
- Tutor videos built from timed narration "beats" with pre-generated MP3 narration (Edge Neural TTS) and WebVTT captions.
- Learner progress, consent records and certificates in `localStorage`; optional Supabase sync using the anon key.
- Staff dashboard (enrolment, completion, recent activity) behind a sign-in that is not real authentication.
- Content/narration consistency tests using Node's test runner.

It was built for, and sold to, a client (a supported-living care provider) as a digital skills course.
It contains no programming exercises, no code execution, no backend and no AI/LLM features.

## Module status (update as the project goes)

| Module | Status | Notes |
|---|---|---|
| `iLearn.dc.html` (shell, routing, learner state, dashboard) | Reused → to be modified | To be split into modules; `code` activity view added |
| `support.js` | Reused | |
| `lesson-video.js` | Reused (may be dropped) | Narrated beats; only kept if tutor narration is used (Could requirement) |
| `course-data.js` | To be replaced | Confident Computing content removed; programming exercises added |
| `audio/`, `voiceover-scripts/`, voiceover scripts | To be removed | Not part of the project |
| `cloud-config.js`, `SUPABASE-SETUP.sql` | To be modified | Supabase Auth, per-user rows |
| Backend (Express) | New | |
| Python runner (Pyodide) | New | |
| Java runner | New | |
| Hint service + hint ladder | New | Core contribution |
| Leak guard | New | Core contribution |
| Evaluation harness | New | |

## AI assistance in the baseline

_Fill in honestly: which parts of the pre-project iLearn code, if any, were written with AI assistance.
You will be asked to explain reused code in the viva as well._
