# Mélinda — Model Portfolio

A responsive editorial portfolio with original portfolio imagery, an asymmetric gallery, an alternate photo index, full-screen image browsing, swipe and keyboard navigation, and reduced-motion support.

## Run locally

```sh
npm start
```

Open http://localhost:4173. No dependencies or installation are required (Node.js and Python 3 are used by the helper scripts).

## Build

```sh
npm run check
npm run build
```

Deploy `dist/` to any static host. All local assets use relative URLs, including on a GitHub Pages project path. The source directory is also directly servable. Typography uses local system fonts; the site makes no external font requests.

## Update content

- Contact, biography and measurements: `index.html`
- Gallery order and captions: `photoData` in `main.js`
- Photography: `public/images/01.webp` through `19.webp`
- Visual design and mobile layouts: `styles.css`

Photographs and measurements originate from the [Canva portfolio supplied by the site owner](https://www.canva.com/design/DAGCjmGiXLM/qrPvxOal2R5AYcRba0Ys7w/view). The 18-photo selection omits the supplied collage screenshot (`03.webp`). Confirm image permissions before redistribution. No analytics, trackers, backend services or contact-form credentials are needed.
