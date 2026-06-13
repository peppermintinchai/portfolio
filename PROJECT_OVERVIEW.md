# Project Overview

Tiffany Dong's portfolio is a static site built around one main page, a few focused CSS/JS modules, and local media. It is meant to be easy to open, edit, and publish without a backend.

## Structure

- `index.html` is the live portfolio page.
- `assets/css/` holds layout, media, form, resume, and interaction styles.
- `assets/js/` handles tabs, boot screen behavior, forms, media windows, audio, video, theme, and small sound effects.
- `assets/img/` holds stills, project images, and video poster frames.
- `assets/video-h264/` holds the web video files. These should stay untouched unless the source video itself is intentionally replaced.
- `assets/audio/` holds MP3 recordings.
- `assets/docs/` holds the resume, PDFs, and the writing archive page.
- `scripts/` holds the build/deploy helpers.

## Editing Notes

- Keep file paths relative, like `assets/img/example.jpg`.
- If an image, PDF, audio file, or video is referenced in HTML, make sure the file exists inside this repo.
- Do not link to files in Downloads, Desktop, or another personal folder.
- Keep video replacements in H.264 MP4 when possible. GitHub Pages can serve them directly, and they are easier to preview.
- Run the build script before deploying if you want the minified `dist/` version.

## Deployment

The repo can be published directly from `main`, or through the built `dist/` folder on a Pages branch. The build script minifies text assets and optimizes still images, but it only copies videos and verifies their checksums.
