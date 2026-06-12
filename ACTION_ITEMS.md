# Action Items

These are the things worth remembering before the site is published or shared widely.

## Before Publishing

- Make sure every referenced image, PDF, MP3, and video exists in `assets/`.
- The 2026 BU Concert Band videos are now in `assets/video-h264/`, but they are very large. Make web-sized MP4 copies before trying to publish through GitHub.
- Keep private or raw media out of the public repo.
- Check the site on a phone-sized screen.
- Test at least one video popout and one audio recording.
- Test both request modals without sending real messages.

## Privacy

The site is static. That means anything in the HTML, JavaScript, or assets can be seen by the public once deployed.

The availability gate is a visual gate only. Do not put anything behind it that would be a problem if someone found it in page source.

## Media

- Prefer web-ready MP4 files for public video.
- Avoid new filenames with spaces or parentheses when possible.
- Keep poster images next to any new video card.
- Watch file size. GitHub has hard limits, and big videos make the repo annoying to clone.

## Forms

The forms use Formspree. That is fine for lightweight requests, but it is not a private backend.

If spam becomes a problem, add Formspree-side spam controls or move the forms behind a small backend.

## Cleanup Later

- Split CSS and JavaScript out of `index.html` if the site keeps growing.
- Add a small asset checker for local paths.
- Add browser smoke tests for tabs, media popouts, audio rows, and forms.
- Retire old/deleted docs and media paths instead of leaving stale references around.
