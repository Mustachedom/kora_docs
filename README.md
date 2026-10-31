# Kora Docs

A client-side React documentation site for Kora resources. Search and navigation
run in the browser; the site does not need an application server or runtime API.

## Run locally

```sh
npm ci
npm run dev
```

Create a production build and preview it locally with:

```sh
npm run build
npm run preview
```

## Publish to GitHub Pages

1. Create a GitHub repository named `kora_docs`.
2. Put the contents of this folder at the repository root, including `.github/workflows/pages.yml`.
3. Push the `main` branch.
4. In the repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
5. After the workflow completes, the site will be available at `https://YOUR-USERNAME.github.io/kora_docs/`.

The workflow installs the locked npm dependencies, builds the site, and deploys
the `dist` folder on each push to `main`. Vite uses `/kora_docs/` as its asset
base in GitHub Actions and keeps a relative asset base for local preview.

## Adding documentation

Add page content under `src/`, then register its resource, module, and realm
pages in `src/registry.js`. The navigation, search, routes, and previous/next
links are generated from that registry.
