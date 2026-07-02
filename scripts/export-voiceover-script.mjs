#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { course } = await import(pathToFileURL(join(root, 'course-data.js')).href);
const { buildTimeline, cleanNarrationText } = await import(pathToFileURL(join(root, 'lesson-video.js')).href);
const outDir = join(root, 'voiceover-scripts');
await mkdir(outDir, { recursive: true });

const all = [];
for (let i = 0; i < course.lessons.length; i++) {
  const lessonNo = i + 1;
  const lesson = course.lessons[i];
  const beats = buildTimeline(i).map((beat, idx) => ({
    lesson: lessonNo,
    lessonTitle: lesson.title,
    beat: idx + 1,
    kind: beat.kind || 'demo',
    text: cleanNarrationText(beat.say),
    estimatedSeconds: Math.round((beat.dur || 0) / 1000),
  }));
  all.push({ lesson: lessonNo, title: lesson.title, beats });
  const lines = beats.map((b) => `${String(b.beat).padStart(2, '0')}. [${b.kind}] ${b.text}`).join('\n\n');
  await writeFile(join(outDir, `lesson-${String(lessonNo).padStart(2, '0')}.txt`), `${lesson.title}\n${'='.repeat(lesson.title.length)}\n\n${lines}\n`, 'utf8');
}
await writeFile(join(outDir, 'all-lessons.json'), JSON.stringify({ generatedAt: new Date().toISOString(), lessons: all }, null, 2), 'utf8');
console.log(`Exported tutor scripts for ${all.length} lessons to ${outDir}`);
