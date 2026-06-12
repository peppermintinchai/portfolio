# Test Plan

Use this before publishing changes. The site is static, so the checks are mostly about loading, links, media, and forms.

## Quick Smoke Check

- Open the site locally.
- Enter from the boot screen by clicking `enter`.
- Reload and make sure the entry screen still works.
- Click each main tab: Game Dev, Music, Film, Resume, Availability.
- Make sure only the selected tab content is visible.
- Open at least one music video popout.
- Close the popout with the `x` button and with Escape.
- Play one audio recording and scrub the progress bar.
- Open the writing archive from Resume.
- Download or open the resume PDF.

## Mobile Check

Test around 390px wide if possible.

- Header text should wrap cleanly.
- Tabs should scroll horizontally without hiding the active tab.
- Buttons should be easy to tap.
- Request modals should fit on screen and scroll inside the modal.
- Media popouts should stay inside the viewport.
- Audio controls should be usable without zooming.

## Forms

For both request modals:

- Empty submit shows a name error.
- Name only shows an email error.
- Name and email without a checkbox shows a topic/reason error.
- Submit button disables while sending.
- Failed submit returns control to the user.
- Closing the modal returns focus to the button that opened it.

Do not test live Formspree repeatedly unless you actually want to send test emails.

## Asset Checks

Before deploy, every local path in `href`, `src`, and `poster` should exist.

Pay special attention to:

- files with spaces in the name
- video paths
- PDF paths in `assets/docs/writing-archive.html`
- Open Graph / Twitter preview image paths

## Media Checks

- Video cards should show a poster or a clear placeholder.
- Local videos should open in the floating player.
- The floating player should show native controls.
- Videos that are supposed to have sound should not open muted.
- Audio rows should not play over each other.

## Links

- External links should open in a new tab.
- External links with `target="_blank"` should keep `rel="noopener"`.
- The writing archive back link should return to the main portfolio.

## Privacy Reminder

Anything in static HTML is public. Do not put private schedules, credentials, access keys, or private clips in the repo unless they are meant to be public.
