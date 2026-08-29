# iLearn — Confident Computing

A browser-based digital-skills course for adults in supported living: 16
lessons, each with a narrated tutor video and 15 practice activities, plus a
staff dashboard for tracking progress. It runs as a static site with no backend
and no build step.

## Why I built it

Support workers were teaching the same basic computing skills one-to-one —
signing in, using a mouse, sending an email — with no shared material and no
record of what a learner had already covered. The constraint that shaped
everything was that it had to run on whatever hardware a supported-living
service already has, with no install, no account setup and no IT project. That
pushed it towards a single HTML file served over HTTP.

The learners are the reason the accessibility choices are not optional: every
lesson is narrated, every line of narration has a caption file, and activities
are readable at a slow pace with no time pressure.

## What it does

- 16 lessons, each with a scripted tutor video assembled from timed "beats" —
  narration paired with a simulated on-screen UI (a Word window, a browser, a
  sign-in box) rendered in HTML rather than recorded as video.
- Real MP3 narration generated ahead of time, with WebVTT captions for every
  line and a fallback to browser speech synthesis if a file is missing.
- 240 practice activities across three types: guided practice, multiple choice,
  and type-the-answer.
- Learner progress, consent records and certificates, stored in the browser.
- A staff dashboard showing enrolment, completion and recent activity.

## Tech stack

Plain JavaScript ES modules, HTML and CSS — no framework and no bundler.
Microsoft Edge Neural TTS (via `edge-tts`) for narration. Optional Supabase
Postgres for cross-device sync. Tests use Node's built-in `node:test`. Deployed
as a static site on Render.

## Architecture

```
iLearn.dc.html    the application — UI, router, learner state, staff dashboard
course-data.js    the content: 16 lessons, 240 activities
lesson-video.js   turns a lesson into a timeline of narrated beats
support.js        shared runtime helpers
cloud-config.js   optional Supabase credentials (blank = local-only)
audio/            generated MP3s + VTT captions + the manifest tying them to beats
scripts/          the voiceover generator and script exporter
test/             content and narration integrity tests
```

The content pipeline is the part worth explaining. `course-data.js` holds the
lessons. `buildTimeline(i)` in `lesson-video.js` turns lesson *i* into an ordered
list of beats, each with narration text, an HTML fragment and a duration.
`scripts/generate-voiceover-edge.mjs` walks those same beats, generates one MP3
and one VTT per beat, and writes `audio/voiceover-manifest.json` mapping lesson
and beat number to a file. At runtime the app reads the manifest: a beat with an
entry plays real audio, a beat without one falls back to the browser's speech
synthesis.

That means the content and the audio can drift — add a beat and the narration is
silently out of date. `test/course.test.mjs` checks the alignment, which is the
main thing the tests are for.

## Key engineering decisions

**No framework, one HTML file.** The deployment target is a support worker
opening a link on a shared laptop. A build step would have meant a toolchain to
keep working; a framework would have meant a bundle to download on a slow
connection. The cost is that `iLearn.dc.html` is large and everything is in one
scope, which would be the first thing to change if the course grew.

**Narration generated ahead of time, not spoken live.** Browser speech synthesis
varies by device and sounds different on every machine — for a learner following
along, that inconsistency matters. Pre-generating with a fixed voice
(`en-GB-SoniaNeural` at -8% speed) gives every learner the same tutor. Edge
Neural TTS over a paid API because it is free, and this had no budget. The
generator is idempotent: it skips files that already exist, so a failed run
resumes rather than regenerating four hundred clips.

**The UI in the tutor videos is drawn in HTML, not screen-recorded.** Recordings
go stale the moment an operating system changes, they cannot be captioned
automatically, and they cannot be edited without re-recording. Building the
"screens" as HTML fragments means a lesson can be corrected in a text editor.

**Local storage by default.** With no backend, the browser is the only store
that requires nothing of the deploying service. Supabase sync is opt-in and off
unless credentials are filled in.

## Data protection — read this before real learner data

Two limits are deliberate for a pilot and are not safe for real data:

**Staff sign-in is not authentication.** Any correctly-formatted email with a
6-character password opens the staff dashboard. There is no server to check a
credential against. On a public URL, anyone with the link can open it.

**The optional Supabase sync cannot be made confidential as built.** This is a
static site, so the only credential it can carry is the anon key, and that ships
inside the page to every visitor. The key being public is by design and is not
itself the problem. The problem is the consequence: the row-level security
policy has to be permissive enough for the staff dashboard to list every
learner, which makes it permissive enough for anyone who reads the page source
to do the same. No amount of policy tuning fixes that while there is no backend
— it is what "no backend" means.

`cloud-config.js` therefore ships blank, and the app runs local-only until
someone fills it in. `SUPABASE-SETUP.sql` sets out the least-permissive policy
that still works for a pilot, and the shape of the change needed before real
data: Supabase Auth, a per-row owner, and policies keyed on `auth.uid()`.

Until both of those are addressed, pilot with fabricated names and no real
support notes. This build has not been independently reviewed for security,
accessibility conformance or data protection.

## Challenges

Keeping narration and content in step was the recurring one. The beats are
derived from the lesson data rather than written separately, which avoids one
class of drift, but the generated audio is a separate artefact on disk and
nothing connected the two. Editing a lesson left the old audio in place and the
app happily played it — the mismatch was invisible until someone listened. That
is why the manifest exists and why the tests check it.

Generating four hundred audio files over a network is also its own problem:
individual calls fail, and a run that restarts from zero each time is unusable.
The generator writes each file as it goes, treats an existing file over 1KB as
done, and reports what failed so a re-run only picks up the gaps.

## What I learned

- Two artefacts that must agree need something that checks they agree. The
  manifest test is nine lines and catches the bug the whole pipeline is prone to.
- "It stores data in the browser" and "it is safe to put real people in it" are
  unrelated statements, and I had written documentation that let the first imply
  the second.
- Accessibility constrains the architecture, not just the CSS. Captions for every
  line meant the narration had to be a build artefact rather than something
  spoken at runtime.
- A generator that cannot resume is a generator you stop using.

## Running locally

The app uses ES modules, so it needs to be served over HTTP — opening the file
directly with `file://` blocks the imports.

```bash
npm run serve                       # python3 -m http.server 8000
```

Then open http://localhost:8000/iLearn.dc.html.

Sign in as a learner by typing a name and pressing **Start my course**, or
switch to **I'm staff** (see the note above about what that does and does not
check).

```bash
npm test                            # content and narration integrity
```

## Regenerating the narration

Requires Python 3; the script installs `edge-tts` on first run.

```bash
npm run voiceover:free              # generate MP3s + VTT captions + manifest
npm run voiceover:script            # export the spoken scripts only, no audio
```

Existing files are skipped unless `FORCE=1`. `LESSON=3` limits it to one lesson,
and `EDGE_VOICE` / `EDGE_RATE` override the voice. Output lands in `audio/` and
`voiceover-scripts/`.

## Future improvements

- Replace the staff sign-in with real authentication. Everything else in the
  data-protection section follows from this one change.
- Split `iLearn.dc.html` into modules; it is past the size where one file helps.
- Check generated audio against the narration text it came from, so an edited
  line is detected rather than just an added beat.
- An accessibility audit against WCAG 2.2 AA by someone who is not me, including
  screen-reader testing — the current claims are based on my own checks.
