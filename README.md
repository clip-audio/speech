# Speech Shelf

A separate, dependency-free, frontend-only ElevenLabs speech library. The replay buffer app at the repository root is independent.

## Run

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/elevenlabs/ . Keep the same host and port to retain access to the same browser storage. Use localhost or HTTPS rather than opening the HTML as a file.

1. Open Settings, paste your ElevenLabs API key, and save. Give the key access to text-to-speech, voices, and history.
2. Sync all history to fetch your existing generations, including speech made on ElevenLabs’ website. History is paginated and cached; syncing merges items without deleting local names or favorites. The API returns the history available to the key’s workspace; unavailable/deleted history cannot be restored.
3. Type in the composer to fuzzy-match generated text. Every suggestion identifies the ElevenLabs voice that generated that clip. Reuse selects both text and voice. Play and Save retrieve existing audio without generating speech. Generate makes a new, credit-consuming API request.
4. Star clips or set a priority from 0–999. Relevant starred clips rank first, followed by priority, match quality, and recency. Search also matches voice names and custom names. Voice variants remain separate clips.
5. Edit a clip name in the library. Saved filenames include that name (or text), ElevenLabs voice, and full history ID to avoid collisions.
6. Choose a download folder in a browser supporting the File System Access API (Chrome/Edge). Folder permission is requested by the browser, the handle is remembered in IndexedDB, and access is checked on save. Enable auto-save to save new generations there. Download selected saves multiple clips sequentially. Browsers without folder support use normal downloads; browser multi-download permissions may apply.

## Storage and backups

- Settings, API key, history metadata, names, stars and priorities are in localStorage under `speech-shelf-v1`. The key is plaintext, as requested. Use a trusted browser profile and origin. Requests go directly to `https://api.elevenlabs.io`; no proxy or backend is included.
- Audio blobs and the folder handle are in IndexedDB. Storage is subject to browser quota and eviction. Keep important audio in your local folder.
- Export JSON backs up settings and history metadata. The API key is excluded unless “Include API key in export” is checked. Import replaces settings/library metadata, keeps your current API key when the file omits one, and does not import audio or folder permissions. Store exports containing keys privately.
- Folder saves also write `speech-shelf-manifest.json` with text, voice, history IDs, filenames, stars, priorities, and the last saved filename. Export file manifest works independently. Renaming a clip changes future save names; it does not delete or rename previously downloaded files. Save again for a newly named copy. The manifest’s `savedFilename` records the previous saved file until a new save completes.
- Generation responses whose history ID is not exposed by browser CORS headers receive a local ID. Those clips remain playable from browser audio storage. A later sync may show the server copy separately. Settings JSON does not back up cached audio; save the files themselves.
- History synchronization and playback require the relevant API key permissions. API errors appear in the status bar. No live API requests or paid generations are made until you connect your key and invoke an action.

API references: [history](https://elevenlabs.io/docs/api-reference/history/list), [history audio](https://elevenlabs.io/docs/api-reference/history/get-audio), [speech generation](https://elevenlabs.io/docs/api-reference/text-to-speech/convert), [voices](https://elevenlabs.io/docs/api-reference/voices/search).

## Checks

```sh
node --test elevenlabs/core.test.mjs
node --check elevenlabs/app.js
```

Run `python3 version.py` from the repository root as the final editing step after app changes. It stamps both apps’ asset URLs and visible build versions.

## Playback outputs

Choose independent Preview and Voice-chat outputs above the composer. Library clips have separate Preview and Voice chat buttons; generation automatically previews only. Stop all playback stops both players. Output choices are included in settings JSON; device authorization may need repeating after import or browser restart.

Use Authorize audio devices to grant output access. Browsers without a native output chooser may ask for microphone access to expose output names; the microphone stream is immediately stopped, never recorded or transmitted. Device changes stop playback. If a chosen device is unavailable, playback fails rather than switching to another output.

For voice chat, install/configure a virtual audio cable separately, select its output in Speech Shelf, and select its input as the microphone in the chat application. This frontend does not create a virtual microphone or mix your physical microphone. Voice-chat playback requires an explicitly selected output.

Existing audio is retrieved from IndexedDB first, then downloaded from ElevenLabs history only on a cache miss. An in-memory cache also avoids repeat requests during a session if IndexedDB cannot save. Concurrent requests for the same clip share one download. This is app-managed caching, independent of HTTP/browser cache, and does not automatically save files into the chosen folder.

## History-only interface

Speech creation is currently hidden because free accounts cannot generate with library voices through the API. Generate on the ElevenLabs website, then use Sync all history here. The library retains search, stars, preview, voice-chat output, naming and downloads. Generation code and settings remain for future re-enablement.

## Incremental history sync

Sync new history checks newest items first and stops after reaching the checkpoint from the previous successful sync, usually needing one metadata request. The first sync after this feature is installed reads the entire history to establish a reliable checkpoint. Interrupted syncs keep fetched clips but do not advance the checkpoint, so retrying does not leave gaps. Refresh all history deliberately reads every page to refresh older metadata; local stars, names and audio remain intact. Sync fetches metadata only, not audio. It merges history and does not remove locally cached entries deleted on ElevenLabs.

## Keyboard playback

With focus in library search or on the page, Enter sends the highlighted clip to voice chat; Shift+Enter previews it. The first result is highlighted automatically, and changing the search or filters resets the highlight to the first match. Arrow Up/Down moves the highlight, stopping at the ends and keeping the result visible. Clicking a clip’s text highlights it. Shortcuts leave settings, filename/priority editing, buttons and native audio controls alone. Holding Enter does not repeatedly restart playback.

## Playback speed

The Playback speed selector supports 0.75×, 1×, 1.1×, 1.25×, 1.5×, 1.75×, 2×, 2.5× and 3× for both preview and voice chat, including keyboard playback. Changes take effect immediately, preserve pitch where supported by the browser, and are saved in settings JSON/localStorage. Cached audio and downloaded files remain at their original speed; no regeneration or extra API request is needed.
