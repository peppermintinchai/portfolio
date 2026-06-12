# Developer Notes

This repo should stay easy to edit and easy to publish. Keep changes small unless Tiffany asks for a larger rebuild.

## Keep The Site Static

- `index.html` is the main site.
- Do not add npm, a framework, a build step, or a backend unless that is the actual request.
- The site should keep working on GitHub Pages.
- If something needs real privacy, do not fake it with frontend JavaScript.

## Assets

Use the existing folders:

- `assets/img/` for photos and project images
- `assets/img/video-posters/` for video thumbnails
- `assets/audio/` for MP3s
- `assets/video-h264/` for public videos
- `assets/docs/` for PDFs and document pages

Avoid referencing raw local files or anything outside the repo. If HTML points to an asset, that asset needs to be present in the deployed copy of the site.

New filenames should be lowercase and hyphenated when possible. Spaces in old filenames are okay if already referenced, but do not add more unless there is a reason.

## Media

- Prefer MP4/H.264 with AAC audio for public videos.
- Do not point production HTML at raw `.mov` files unless the file is intentionally public and tested.
- Add a poster image for any new video card.
- Check large files before committing. Anything near GitHub's limit needs a different plan.

## Editing The Page

- Match the existing tab structure: `.tab` buttons point to `#pane-*` sections.
- Keep `.active` and `aria-selected` in sync.
- Keep video cards inside `.frame-16x9` so the popout player can find them.
- Keep request forms inside the existing modal pattern.
- Keep external `target="_blank"` links paired with `rel="noopener"`.

## Things To Test

After a meaningful change, check the part you touched and one nearby flow:

- boot entry
- tab switching
- video popout open/close
- audio play/seek
- resume and writing links
- request modal validation
- mobile layout around 390px wide

For path changes, check every new `href`, `src`, and `poster`.

## Public Content Rule

Assume the repo and the deployed site are public. Do not put private schedules, private clips, access keys, credentials, or secrets in static files.
