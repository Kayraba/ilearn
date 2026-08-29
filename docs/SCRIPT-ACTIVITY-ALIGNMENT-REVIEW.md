# Script and Activity Alignment Review

## Verdict
The lesson narration now matches the activity structure much better.

Each lesson script now follows this tutor flow:

1. Lesson title and purpose
2. Plain-English learning outcome
3. Step-by-step tutor demonstration
4. Activity guide explaining what the learner will do below the video
5. Common mistake to watch for
6. Encouraging close and instruction to continue to the activities

## What changed
An `activity-guide` narration beat has been added to every lesson. This means the tutor no longer just says “scroll down to the activities.” The tutor now explains the activity pattern before the learner starts:

- Warm-up task
- Quick check questions
- Real-computer practice
- Typed/reflection task
- Stretch or finish activity

This makes the narration feel more like an actual tutor preparing the learner for the tasks.

## Important note about length
These are no longer tiny 10–15 second voiceovers. They are fuller tutor-style scripts.

Estimated spoken length is roughly 2.4 to 3.2 minutes per lesson at a calm support-worker pace. This is more suitable for supported learners than rushing each lesson into exactly 2 minutes.

## What still matters
The generated MP3 files are not included until you run:

```bash
npm run voiceover:free
```

That command creates realistic Microsoft Edge Neural TTS narration from the full scripts.

## Client-facing view
The scripts now make sense with the activities. They explain the skill first, then tell the learner what the activity section will ask them to do. This is better for a council/client pilot than a short intro voiceover that does not connect to the tasks.
