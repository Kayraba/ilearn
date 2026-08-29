# Generate the realistic tutor voiceovers locally

I could not generate the Microsoft Edge Neural TTS MP3 files inside ChatGPT because this environment cannot reach Microsoft's speech service (`speech.platform.bing.com`).

The project is ready to generate them on your computer.

## What this creates

Running the command creates:

- `audio/lesson-01-01.mp3`, `lesson-01-02.mp3`, etc.
- matching `.vtt` caption files
- `audio/voiceover-manifest.json`

The app will use `audio/voiceover-manifest.json` automatically when it exists.

## Windows / Git Bash steps

Open Git Bash inside the unzipped project folder and run:

```bash
python --version
npm run voiceover:free
```

If `python` is not found, install Python 3 from https://www.python.org/downloads/ and tick **Add Python to PATH** during install.

## Windows PowerShell steps

Open PowerShell inside the unzipped project folder and run:

```powershell
python --version
npm run voiceover:free
```

## Choose a different voice

Default voice:

```text
en-GB-SoniaNeural
```

Other good voices:

```text
en-GB-RyanNeural
en-GB-LibbyNeural
en-US-JennyNeural
en-US-GuyNeural
```

In Git Bash:

```bash
EDGE_VOICE=en-GB-RyanNeural npm run voiceover:free
```

In PowerShell:

```powershell
$env:EDGE_VOICE="en-GB-RyanNeural"
npm run voiceover:free
```

## Make the voice slower or faster

The default is slower and tutor-like:

```text
EDGE_RATE=-8%
```

In Git Bash:

```bash
EDGE_RATE=-12% npm run voiceover:free
```

In PowerShell:

```powershell
$env:EDGE_RATE="-12%"
npm run voiceover:free
```

## Regenerate everything from scratch

Delete the generated files first:

```bash
rm -f audio/lesson-*-*.mp3 audio/lesson-*-*.vtt audio/voiceover-manifest.json
npm run voiceover:free
```

On Windows PowerShell:

```powershell
Remove-Item audio\lesson-*-*.mp3, audio\lesson-*-*.vtt, audio\voiceover-manifest.json -ErrorAction SilentlyContinue
npm run voiceover:free
```

## Uploading voices to Claude Design

After generation finishes, upload:

1. the whole updated project ZIP, or
2. just the `audio/` folder containing:
   - all `lesson-XX-YY.mp3` files
   - all `lesson-XX-YY.vtt` files
   - `voiceover-manifest.json`

The manifest is important. Without it, the app may fall back to browser speech instead of the generated MP3s.

## Common problems

### `argument --rate: expected one argument`
This ZIP fixes that issue by passing rate values as `--rate=-8%`.

### `Cannot connect to speech.platform.bing.com`
That means your network is blocking Microsoft speech. Try another Wi-Fi/network or disable VPN/firewall temporarily.

### The voice still sounds robotic
That means the app did not find `audio/voiceover-manifest.json` or the generated per-beat MP3 files. Run `npm run voiceover:free` again and confirm the manifest exists.
