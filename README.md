# 张荘 · Personal Homepage

Personal academic homepage for **张荘**, an undergraduate student at the School of Artificial Intelligence and Data Science, University of Science and Technology of China.

## Highlights

- Claude-inspired warm, editorial visual system
- Responsive single-page research portfolio
- Selected work, experience, education, honors, and contact information
- Static export with automated GitHub Pages deployment
- Open Graph, sitemap, robots, and structured Person metadata

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The static output is generated in `dist/client`.

## Deployment

Every push to `main` triggers `.github/workflows/deploy-pages.yml` and publishes the site to GitHub Pages.
