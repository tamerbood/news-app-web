# Mada Alalam — News Web Application

An Arabic-language news website built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. This repository contains the web frontend for Mada Alalam (مدى العالم).

**Website:** https://madaalalam.com/

## Features

- Arabic news browsing with article pages and category navigation
- News sources, sports, and original-content sections
- Account registration and login interfaces
- Administration interfaces for articles, categories, sources, stories, and editorial workflows
- Search-engine support, including metadata, robots, and sitemap routes
- Responsive frontend components

> Some features depend on a separately configured backend API. This repository is not a standalone news data service. Availability of features depends on the connected backend and its configuration.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Getting started

Prerequisites: a Node.js version compatible with Next.js 16 and npm.

```bash
git clone https://github.com/tamerbood/news-app-web.git
cd news-app-web
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

Visit http://localhost:3000. Set your backend URL in `.env.local` if you want API-backed features to work. Never commit real API credentials or production secrets.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API used by the frontend |
| `NEXT_PUBLIC_SITE_URL` | Public website URL for canonical metadata and sitemaps |

Variables beginning with `NEXT_PUBLIC_` are exposed to browsers. Do not put secrets in them. Additional configuration may be needed for your deployment.

## Development

```bash
npm run dev
npm run lint
npm run build
npm run start
```

Run these commands separately as needed. Available scripts may depend on the current `package.json`.

## Project structure

- `app/` — pages, layouts, UI components, and routes
- `app/admin/` — editorial and administrative interfaces
- `app/lib/` — shared frontend helpers
- `public/` — static assets

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for a suggested contribution workflow. Please do not submit credentials, private data, or third-party content without permission.

## Security

See [SECURITY.md](SECURITY.md) for responsible vulnerability reporting. Never post live credentials in issues.

## License

The source code in this repository is licensed under the [MIT License](LICENSE), except for third-party materials and content subject to separate rights. News articles, photographs, logos, and other editorial content are not automatically licensed under MIT.

## Maintainer

GitHub: [@tamerbood](https://github.com/tamerbood)
