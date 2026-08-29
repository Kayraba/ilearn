# iLearn — Confident Computing

A digital skills course that runs in the browser, built for adults in supported
living. 16 lessons, each with a narrated tutor video and 15 practice activities,
plus a dashboard so staff can see how people are getting on. It's a static site
— no backend, no build step.

## Why I built it

Support workers were teaching the same things one-to-one — signing in, using a
mouse, sending an email — with no shared material and no record of what someone
had already done. The main constraint was that it had to run on whatever laptop
a service already has, with nothing to install and no accounts to set up. That's
why it ended up as a single HTML file you open over HTTP.

The learners are the reason the accessibility bits aren't optional. Every lesson
is narrated, every line has captions, and nothing is on a timer.

## What it does

- 16 lessons, each with a tutor video built from timed "beats" — narration
  paired with a fake on-screen window (Word, a browser, a sign-in box) drawn in
  HTML rather than recorded.
- Real MP3 narration generated in advance, with WebVTT captions for each line.
  If a file is missing it falls back to the browser's speech synthesis.
- 240 practice activities in three formats: guided practice, multiple choice,
  and typing an answer.
- Progress, consent records and certificates, saved in the browser.
- A staff dashboard with enrolment, completion and recent activity.

## Tech stack

Plain JavaScript ES modules, HTML and CSS. No framework, no bundler. Microsoft
Edge Neural TTS (through `edge-tts`) for the narration. Optionally Supabase for
syncing progress between devices. Tests use Node's built-in test runner. Hosted
as a static site on Render.

## How it fits together

```
iLearn.dc.html    the app — UI, routing, learner state, staff dashboard
course-data.js    the content: 16 lessons, 240 activities
lesson-video.js   turns a lesson into a list of narrated beats
support.js        shared helpers
cloud-config.js   optional Supabase settings (blank = local only)
audio/            generated MP3s, VTT captions, and the manifest
scripts/          the voiceover generator and script exporter
test/             content and narration checks
```

The content pipeline is the part worth explaining. `course-data.js` holds the
lessons. `buildTimeline(i)` in `lesson-video.js` turns lesson *i* into an
ordered list of beats, each with narration text, an HTML fragment and a
duration. `scripts/generate-voiceover-edge.mjs` walks the same beats, makes one
MP3 and one VTT per beat, and writes `audio/voiceover-manifest.json` mapping
lesson and beat number to a file. At runtime the app reads that manifest — a
beat with an entry plays the MP3, one without falls back to browser speech.

The problem with that is the content and the audio can get out of sync. Add a
beat and the narration is quietly out of date. That's mostly what the tests in
`test/course.test.mjs` are for.

## Decisions I made and why

**No framework, one HTML file.** The person opening this is a support worker
clicking a link on a shared laptop. A build step means a toolchain I have to
keep working, and a framework means a bundle to download on whatever connection
the building has. The cost is that `iLearn.dc.html` is big and everything is in
one scope, which is the first thing I'd change if the course grew.

**Narration generated in advance rather than spoken live.** Browser speech
synthesis sounds different on every machine, which matters when someone is
following along. Generating it beforehand with one fixed voice
(`en-GB-SoniaNeural` at -8% speed) means everyone gets the same tutor. I used
Edge Neural TTS because it's free and there was no budget. The generator skips
files that already exist, so a run that fails partway resumes instead of
starting over.

**The screens in the videos are HTML, not screen recordings.** Recordings go out
of date as soon as Windows changes, you can't caption them automatically, and
fixing one means recording it again. Building them as HTML means I can correct a
lesson in a text editor.

**localStorage by default.** With no backend, the browser is the only place to
store things that doesn't ask anything of the service deploying it. The Supabase
sync is opt-in and off unless someone fills in the config.

## Data protection — please read before using real learner data

Two things are fine for a pilot and not fine for real data.

**The staff sign-in isn't real authentication.** Any properly formatted email
with a 6-character password gets you into the staff dashboard. There's no server
to check anything against. If the site is on a public URL, anyone with the link
can open it.

**The Supabase sync can't be made private the way it's built.** This is a static
site, so the only credential it can hold is the anon key, and that key is in the
page for anyone to read. That part is normal and by design. The problem is what
follows from it: the row-level security policy has to be open enough for the
staff dashboard to list every learner, which means it's open enough for anyone
who reads the page source to do the same. There's no policy that fixes that
while there's no backend.

So `cloud-config.js` ships blank and the app stays local-only until someone
fills it in. `SUPABASE-SETUP.sql` has the most restrictive policy that still
works for a pilot, plus what would need to change first: Supabase Auth, an owner
column per row, and policies based on `auth.uid()`.

Until both of those are sorted, use made-up names and don't put real support
notes in. This hasn't been reviewed by anyone else for security, accessibility
or data protection.

## Problems I ran into

Keeping the narration and the content in step was the one that kept coming
back. The beats come from the lesson data rather than being written separately,
which helps, but the audio is a separate set of files on disk and nothing linked
the two. If I edited a lesson the old audio stayed there and the app played it
happily — I'd only notice by listening. That's why the manifest exists and why
the tests check it.

Generating 400-odd audio files over a network has its own problems. Individual
calls fail, and something that starts from scratch every time isn't usable. The
generator writes each file as it goes, treats an existing file over 1KB as done,
and tells you what failed so a second run only picks up the gaps.

## What I learned

- If two things have to agree, something needs to check that they agree. The
  manifest test is short and it catches the exact bug this pipeline is prone to.
- "It stores data in the browser" and "it's safe to put real people in it" are
  two different statements, and I'd written docs that made the first sound like
  the second.
- Accessibility changed the architecture, not just the CSS. Wanting captions on
  every line is why the narration had to be generated in advance instead of
  spoken at runtime.
- A generator that can't resume is one you stop using.

## Running it locally

It uses ES modules, so it has to be served over HTTP — opening the file with
`file://` blocks the imports.

```bash
npm run serve                       # python3 -m http.server 8000
```

Then go to http://localhost:8000/iLearn.dc.html.

Sign in as a learner by typing a name and pressing **Start my course**, or
switch to **I'm staff** (see the section above about what that does and doesn't
check).

```bash
npm test                            # content and narration checks
```

## Regenerating the narration

Needs Python 3. The script installs `edge-tts` the first time you run it.

```bash
npm run voiceover:free              # MP3s + captions + manifest
npm run voiceover:script            # just the scripts, no audio
```

It skips files that already exist unless you set `FORCE=1`. `LESSON=3` does one
lesson, and `EDGE_VOICE` / `EDGE_RATE` change the voice. Output goes to `audio/`
and `voiceover-scripts/`.

## Things I'd do next

- Replace the staff sign-in with real authentication. Everything else in the
  data protection section follows from that one.
- Split `iLearn.dc.html` up. It's got too big for one file.
- Check the generated audio against the text it came from, so an edited line
  gets caught and not just an added beat.
- Get someone who isn't me to do an accessibility audit against WCAG 2.2 AA,
  including screen reader testing. At the moment it's only been checked by me.
