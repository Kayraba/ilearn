# Voiceover Activity Alignment Tests

## Checks completed

- Parsed `course-data.js` successfully.
- Built lesson timelines for all 16 lessons.
- Confirmed every lesson now includes an `activity-guide` beat.
- Re-exported `voiceover-scripts/lesson-01.txt` through `lesson-16.txt`.
- Confirmed JavaScript syntax passes for:
  - `lesson-video.js`
  - `scripts/export-voiceover-script.mjs`
  - `scripts/generate-voiceover-edge.mjs`

## Result

The tutor scripts now explain the same skills that appear in the learner activities. They do not list all 15 activities one by one, because that would make the video too long, but they explain the activity pattern in enough detail for a learner/support worker to understand what to do next.

## Remaining action

Run this on a computer with internet access to generate the realistic MP3 files:

```bash
npm run voiceover:free
```
