# Kora Docs

A client-side React documentation site. The first reference documents the
`kora_lib` distance module in its client and server realms. The module does not
define shared APIs, so there is no shared page yet.

## Run locally

```sh
npm install
npm run dev
```

The site is static after building and can be served from any static host:

```sh
npm run build
npm run preview
```

Search and page navigation run in the browser; there is no application server
or runtime API dependency. Add future resource/module references to
`src/data.js` and reuse the page layout in `src/main.jsx`.
