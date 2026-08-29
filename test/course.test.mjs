/**
 * The course content and the generated narration are two artefacts that have to
 * stay in step: lesson-video.js builds a timeline of beats from course-data.js,
 * and scripts/generate-voiceover-edge.mjs writes one MP3 per beat. If a lesson
 * gains a beat and the audio is not regenerated, the app silently falls back to
 * browser speech for that line — which is exactly the failure a learner notices
 * and a developer does not. These tests check that alignment, plus the content
 * invariants the UI assumes.
 */
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { course } from "../course-data.js";
import { buildTimeline, cleanNarrationText, timelineDuration } from "../lesson-video.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "audio", "voiceover-manifest.json");
const pad = n => String(n).padStart(2, "0");

test("the course has 16 lessons, each with a title, goal and outcome", () => {
  assert.strictEqual(course.lessons.length, 16);
  for (const [i, lesson] of course.lessons.entries()) {
    for (const field of ["title", "goal", "outcome"]) {
      assert.ok(lesson[field]?.trim(), `lesson ${i + 1} is missing ${field}`);
    }
  }
});

// `minutes` is deliberately optional — the practice panel only renders the
// clock when a task carries one. `type` is not optional: the renderer switches
// on it, so an unknown value would draw an activity with no way to answer it.
const ACTIVITY_TYPES = new Set(["practice", "pick", "type"]);

test("every lesson has 15 activities, each with a question and a renderable type", () => {
  for (const [i, lesson] of course.lessons.entries()) {
    assert.strictEqual(lesson.tasks.length, 15, `lesson ${i + 1} has ${lesson.tasks.length} tasks`);
    for (const [j, task] of lesson.tasks.entries()) {
      assert.ok(task.q?.trim(), `lesson ${i + 1} task ${j + 1} has no question`);
      assert.ok(ACTIVITY_TYPES.has(task.type),
        `lesson ${i + 1} task ${j + 1} has unknown type ${JSON.stringify(task.type)}`);
      if (task.minutes !== undefined) {
        assert.ok(Number(task.minutes) > 0, `lesson ${i + 1} task ${j + 1} has a non-positive time estimate`);
      }
    }
  }
});

test("lesson titles are unique, so progress keys cannot collide", () => {
  const titles = course.lessons.map(l => l.title);
  assert.strictEqual(new Set(titles).size, titles.length);
});

test("every beat has narration and a positive duration", () => {
  for (let i = 0; i < course.lessons.length; i++) {
    const beats = buildTimeline(i);
    assert.ok(beats.length > 0, `lesson ${i + 1} produced no beats`);
    for (const [j, beat] of beats.entries()) {
      assert.ok(cleanNarrationText(beat.say).trim(), `lesson ${i + 1} beat ${j + 1} has empty narration`);
      assert.ok(beat.dur > 0, `lesson ${i + 1} beat ${j + 1} has no duration`);
    }
  }
});

// These learners are supported adults working at their own pace. A lesson that
// runs long is a usability problem, not just a data one.
test("no narrated lesson runs longer than eight minutes", () => {
  for (let i = 0; i < course.lessons.length; i++) {
    const minutes = timelineDuration(i) / 60000;
    assert.ok(minutes <= 8, `lesson ${i + 1} narration is ${minutes.toFixed(1)} minutes`);
  }
});

test("cleanNarrationText strips markup the TTS engine would read aloud", () => {
  assert.strictEqual(cleanNarrationText("Click <b>Start</b> now"), "Click Start now");
  assert.strictEqual(cleanNarrationText(""), "");
  assert.strictEqual(cleanNarrationText(null), "");
});

test("the voiceover manifest has one entry per beat of every lesson", { skip: !existsSync(manifestPath) }, () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (let i = 0; i < course.lessons.length; i++) {
    const lessonNo = i + 1;
    const expected = buildTimeline(i).length;
    const entries = manifest.urls[String(lessonNo)];
    assert.ok(entries, `lesson ${lessonNo} is missing from the manifest — re-run npm run voiceover:free`);
    assert.strictEqual(entries.length, expected,
      `lesson ${lessonNo} has ${expected} beats but ${entries.length} audio files — narration is out of date`);
  }
});

test("every audio file the manifest points at exists on disk", { skip: !existsSync(manifestPath) }, () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const [lessonNo, urls] of Object.entries(manifest.urls)) {
    urls.forEach((url, j) => {
      if (!url) return; // a gap falls back to browser speech by design
      assert.ok(existsSync(join(root, url)),
        `manifest lists ${url} for lesson ${lessonNo} beat ${j + 1}, but the file is missing`);
    });
  }
});

test("each beat has a caption file alongside its audio", { skip: !existsSync(manifestPath) }, () => {
  const missing = [];
  for (let i = 0; i < course.lessons.length; i++) {
    for (let j = 0; j < buildTimeline(i).length; j++) {
      const vtt = join(root, "audio", `lesson-${pad(i + 1)}-${pad(j + 1)}.vtt`);
      if (!existsSync(vtt)) missing.push(`lesson-${pad(i + 1)}-${pad(j + 1)}.vtt`);
    }
  }
  assert.deepStrictEqual(missing, [], "captions are an accessibility requirement, not an extra");
});
