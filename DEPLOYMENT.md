# Deployment

Use this when you want to publish the optimized version of the portfolio to GitHub Pages.

## Setup

Install Node.js 20 or newer, then install the project packages:

```bash
cd /Users/tiffanydong/Downloads/context/projects/portfolio
npm install
```

## Build

```bash
npm run build
```

This creates `dist/`.

The build minifies HTML, CSS, and JavaScript. It also compresses still images. Video files are not compressed or transcoded; they are copied as-is and checked after copying.

Preview the built site:

```bash
npm run preview
```

Open `http://localhost:8080`.

## Publish

Default Pages branch:

```bash
npm run deploy
```

Different branch:

```bash
PAGES_BRANCH=main npm run deploy
```

In the GitHub repo, set Pages to deploy from the branch you publish to. For the default setup, use `gh-pages` and `/`.
