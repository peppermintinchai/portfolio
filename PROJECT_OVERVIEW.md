# Project Overview

This is Tiffany Dong's static portfolio site. It is intentionally simple: one main `index.html`, modular CSS/JS under `assets/`, a small writing archive page, and local media.

The site is meant to work on GitHub Pages or any plain static host. There is no build step, no package manager, and no production backend.

## What Is In Here

- `index.html` is the live portfolio shell.
- `assets/css/` stores the modular stylesheets.
- `assets/js/` stores the modular browser scripts.
- `assets/docs/writing-archive.html` is the public writing page.
- `assets/img/` stores photos, project images, and preview images.
- `assets/img/video-posters/` stores video thumbnails.
- `assets/audio/` stores MP3 recordings.
- `assets/video-h264/` stores web-ready videos.
- `assets/docs/` stores PDFs.

## Main Sections

- Game Dev: `Cries of the Wild`
- Music: concert videos and audio recordings
- Film: photos, clips, and profile links
- Resume: education, work, awards, documents
- Availability: public availability summary and request form

## How It Works

The page is static and loads ordered CSS/JS modules:

- `assets/css/base.css`, `boot.css`, `layout.css`, `media.css`, `forms.css`, `resume-projects.css`, `social-availability.css`, and `context-proof-footer.css`
- `assets/js/utils.js`, `sound.js`, `theme.js`, `boot.js`, `tabs.js`, `forms.js`, `media-windows.js`, `audio-player.js`, `video-controls.js`, and `gates.js`

The JS modules cover the entry screen/minigame, tab switching, request modals, floating media windows, custom audio controls, video setup, and small Web Audio sound effects.

The request forms post to Formspree. The forms are client-side only, so anything sensitive should not be put directly in the static HTML.

## Notes For Future Edits

- Keep links relative, like `assets/img/...`.
- Do not reference files from a personal folder outside this repo.
- If an asset is referenced in HTML, it needs to exist in the deployed site too.
- Prefer MP4/H.264 for public video. Raw `.mov` files are usually too large for GitHub Pages and are easier to break.
- Client-side gates are only visual gates. They are not private authentication.
