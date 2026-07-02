#!/usr/bin/env node
import { mkdir, writeFile, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const audioDir = join(root, 'audio');
const scriptDir = join(root, 'voiceover-scripts');
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const voice = process.env.EDGE_VOICE || 'en-GB-SoniaNeural';
const rate = process.env.EDGE_RATE || '-8%';
const pitch = process.env.EDGE_PITCH || '+0Hz';
const volume = process.env.EDGE_VOLUME || '+0%';
const onlyLesson = process.env.LESSON ? Number(process.env.LESSON) : null;
const force = process.env.FORCE === '1' || process.env.FORCE === 'true';

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: opts.stdio || 'pipe', encoding: 'utf8', ...opts });
  return res;
}
function die(msg) { console.error(`\n${msg}\n`); process.exit(1); }
function cleanForVoice(text) {
  return String(text || '')
    .replace(/<\s*break\s*\/?\s*>/gi, '. ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Checking Microsoft Edge Neural TTS dependency...');
let check = run(python, ['-c', 'import edge_tts']);
if (check.status !== 0) {
  console.log('Installing edge-tts with pip. This only needs to happen once.');
  const install = run(python, ['-m', 'pip', 'install', 'edge-tts'], { stdio: 'inherit' });
  if (install.status !== 0) die('Could not install edge-tts. Install Python 3, then run: python -m pip install edge-tts');
}

const { course } = await import(pathToFileURL(join(root, 'course-data.js')).href);
const { buildTimeline, cleanNarrationText } = await import(pathToFileURL(join(root, 'lesson-video.js')).href);
await mkdir(audioDir, { recursive: true });
await mkdir(scriptDir, { recursive: true });

const manifest = { provider: 'Microsoft Edge Neural TTS', voice, rate, pitch, generatedAt: new Date().toISOString(), urls: {} };
let made = 0, skipped = 0, failed = 0;

for (let i = 0; i < course.lessons.length; i++) {
  const lessonNo = i + 1;
  if (onlyLesson && lessonNo !== onlyLesson) continue;
  const beats = buildTimeline(i);
  manifest.urls[String(lessonNo)] = [];
  const scriptLines = [];
  for (let j = 0; j < beats.length; j++) {
    const beatNo = j + 1;
    const text = cleanForVoice(cleanNarrationText ? cleanNarrationText(beats[j].say) : beats[j].say);
    const mp3Name = `lesson-${String(lessonNo).padStart(2, '0')}-${String(beatNo).padStart(2, '0')}.mp3`;
    const vttName = `lesson-${String(lessonNo).padStart(2, '0')}-${String(beatNo).padStart(2, '0')}.vtt`;
    const textFile = join(scriptDir, `lesson-${String(lessonNo).padStart(2, '0')}-${String(beatNo).padStart(2, '0')}.txt`);
    const mp3Path = join(audioDir, mp3Name);
    const vttPath = join(audioDir, vttName);
    scriptLines.push(`${String(beatNo).padStart(2, '0')}. ${text}`);
    await writeFile(textFile, text + '\n', 'utf8');

    if (!force && existsSync(mp3Path)) {
      const st = await stat(mp3Path);
      if (st.size > 1024) {
        manifest.urls[String(lessonNo)][j] = `audio/${mp3Name}`;
        skipped++;
        continue;
      }
      await rm(mp3Path, { force: true });
    }

    console.log(`Generating lesson ${lessonNo}, line ${beatNo}/${beats.length}: ${mp3Name}`);
    const res = run(python, ['-m', 'edge_tts', '--voice', voice, `--rate=${rate}`, `--pitch=${pitch}`, `--volume=${volume}`, '--file', textFile, '--write-media', mp3Path, '--write-subtitles', vttPath], { stdio: 'pipe' });
    if (res.status !== 0) {
      failed++;
      console.error(res.stderr || res.stdout || `Failed ${mp3Name}`);
      continue;
    }
    const st = await stat(mp3Path).catch(() => ({ size: 0 }));
    if (st.size > 1024) {
      manifest.urls[String(lessonNo)][j] = `audio/${mp3Name}`;
      made++;
    } else {
      failed++;
      console.error(`No valid audio written for ${mp3Name}`);
    }
  }
  await writeFile(join(scriptDir, `lesson-${String(lessonNo).padStart(2, '0')}.txt`), `${course.lessons[i].title}\n${'='.repeat(course.lessons[i].title.length)}\n\n${scriptLines.join('\n\n')}\n`, 'utf8');
  // Remove empty holes at end while keeping beat positions.
  while (manifest.urls[String(lessonNo)].length && !manifest.urls[String(lessonNo)][manifest.urls[String(lessonNo)].length - 1]) manifest.urls[String(lessonNo)].pop();
}
await writeFile(join(audioDir, 'voiceover-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\nDone. Generated ${made}, skipped ${skipped}, failed ${failed}.`);
console.log('The app will automatically use audio/voiceover-manifest.json when it is present.');
if (failed) console.log('Some lines failed. Re-run the command; existing successful files are skipped unless FORCE=1 is set.');
