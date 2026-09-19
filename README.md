# Mélinda — Photographic Portfolio

A photo-first model portfolio. Eighteen large portraits form a long, pinned scroll sequence: each photograph enters from the left, holds at center and exits to the right. The final panel contains body measurements. No headings, captions, biography or contact copy appears in the experience.

## Run locally

```sh
npm start
```

Open http://localhost:4173. No dependencies or installation are required. Helper scripts use Node.js and Python 3.

## Build

```sh
npm run check
npm run build
```

Deploy `dist/` to a static host. Netlify configuration is included. All asset URLs are relative, including on a GitHub Pages project path. The site uses system fonts and makes no external font requests.

## Behavior

- Native page scrolling drives requestAnimationFrame updates without intercepting touch or wheel input.
- Only nearby images are loaded as visitors move through the portfolio.
- Progress indicator and accessible dot navigation link the photography and measurements.
- Reduced-motion preferences replace animated positioning with a natural vertical photo sequence.
- Photographs include screen-reader descriptions even though captions are visually absent.

## Update content

- Image order and accessible descriptions: `photoData` in `main.js`
- Body measurements: `index.html`
- Images: `public/images/01.webp` through `19.webp` with `-640.webp` responsive variants
- Layout, scroll length and mobile sizing: `styles.css`

Photographs and measurements originate from the [Canva portfolio supplied by the site owner](https://www.canva.com/design/DAGCjmGiXLM/qrPvxOal2R5AYcRba0Ys7w/view). The 18-photo selection omits the supplied collage screenshot (`03.webp`). Photographic content retains any original lettering embedded in the images. Confirm image permissions before redistribution.
