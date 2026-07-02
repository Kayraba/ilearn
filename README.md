# iLearn — Confident Computing (Controlled Pilot Build)

An accessible digital-skills learning platform for supported learners. This package is the redesigned front-end product: learner login, progress tracking, narrated lesson videos, 15 interactive activities per lesson, certificates, and a staff/admin dashboard.

## What's in this folder

- `iLearn.dc.html` — the application. Open this through a local web server.
- `course-data.js` — the 16 lessons and 240 activities.
- `lesson-video.js` — the narrated tutor-video engine.
- `support.js` — runtime for the component.
- `audio/` — voiceover files and generated voiceover manifest.
- `voiceover-scripts/` — exported tutor scripts for every lesson.
- `scripts/generate-voiceover-edge.mjs` — free Microsoft Edge Neural TTS generator.
- `VOICEOVER-AND-TUTOR-SCRIPT.md` — voice/caption/script notes.

## How to run it

This uses ES modules, so serve the folder over HTTP. Opening the file directly with `file://` can block imports.

From inside this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/iLearn.dc.html
```

## Signing in for pilot preview

- **Learner:** type a name and press **Start my course**.
- **Staff:** switch to **I'm staff**, enter any work email and a password of 6+ characters.

This standalone preview stores data in the browser using `localStorage`. For a real live pilot with learner data, connect the production backend and persistent database.

## Realistic voiceover: free Microsoft Edge Neural TTS

The app now supports real MP3 narration per lesson beat. This is more reliable than browser speech and avoids ElevenLabs free-plan limits.

Install/use it with:

```bash
npm run voiceover:free
```

Default voice:

```text
en-GB-SoniaNeural at -8% speed
```

The generator creates files like:

```text
audio/lesson-01-01.mp3
audio/lesson-01-02.mp3
audio/lesson-02-01.mp3
```

It also creates:

```text
audio/voiceover-manifest.json
```

When the manifest exists, the app automatically uses the generated MP3 narration. Missing lines fall back to browser speech.

## Tutor scripts

Export the spoken script without generating audio:

```bash
npm run voiceover:script
```

Scripts are saved in:

```text
voiceover-scripts/
```

## Honest pilot status

This is a controlled-pilot build. It has not been independently certified for security, accessibility, data protection, or clinical/educational outcomes. Complete your own review before using real personal data.

## Pilot limits — please read before a council deployment

This build is positioned as a **controlled pilot**. Two design limits to be
clear-eyed about (they are known and acceptable for a pilot with no real
personal data, but must be understood before real learner data is used):

- **Staff sign-in is not real authentication.** Any correctly-formatted email
  and any password of 6+ characters signs in as "Service Lead" and opens the
  admin dashboard. On a public URL, anyone with the link can reach it. A proper
  server-side login is required before storing real personal data.
- **Storage is local by default, with an optional shared database.** Out of the
  box, data is stored in the browser (localStorage) per device. To sync learner
  progress across devices and browsers, configure `cloud-config.js` with a free
  Supabase project (see **Shared database** below). When configured, a learner
  can sign in on any device with the same name and continue where they left off,
  and staff see all learners in one place.

Everything else — the 16 lessons, recorded voiceover, captions and activities —
works as designed.

## Shared database (optional — sync progress across devices)

By default the app stores everything in the local browser. To make progress
follow a learner across devices and browsers, connect a free Supabase database:

1. Create a free project at https://supabase.com
2. Open the Supabase **SQL editor** and run the SQL in **`SUPABASE-SETUP.sql`**
   (creates the `learners` table and its access policy).
3. In Supabase go to **Project Settings → API** and copy:
   - **Project URL**  → paste into `url` in `cloud-config.js`
   - **anon public** key → paste into `anonKey` in `cloud-config.js`
4. Save, commit and push. Done — sign-ins now sync.

How it works: each learner is stored as one row keyed by their name. Sign-in
pulls their record; completing a lesson or recording consent pushes it back.
If the database is unreachable, the app quietly keeps working on the local
browser and syncs again when it can. The anon key is safe to ship in a static
site; for a controlled pilot the row policy allows read/write with that key —
tighten it (add real auth) before storing sensitive personal data.
