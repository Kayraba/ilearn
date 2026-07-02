# Voiceover and caption test results

## Checks run in this environment

Passed:

- `npm run voiceover:script`
- `node --check lesson-video.js`
- `node --check course-data.js`
- `node --check scripts/generate-voiceover-edge.mjs`
- `node --check scripts/export-voiceover-script.mjs`
- Imported `lesson-video.js` successfully and built a lesson timeline.
- Confirmed recorded narration URLs are attached when `setNarration({ base: 'audio', ext: 'mp3' })` is used.

## What could not be completed here

Full Microsoft Edge Neural TTS audio generation could not be run inside this sandbox because the environment cannot resolve/connect to Microsoft’s speech service.

The included generator is ready for your local computer or server. Run:

```bash
npm run voiceover:free
```

## Expected result after running the generator

- MP3 files are created per spoken beat.
- `audio/voiceover-manifest.json` is created.
- The app automatically uses those MP3 files.
- Browser speech becomes fallback only, not the main narrator.

## Remaining human check

After generating MP3s, open the app and test:

1. Start lesson 1.
2. Confirm the voice sounds natural.
3. Confirm captions stay visible and do not overlap the Word/Excel scene.
4. Replay the lesson.
5. Test one Word lesson and one Excel lesson.
6. Test on a tablet/mobile screen.
