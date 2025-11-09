Deployment Link : https://meteo-earth.vercel.app/login

# Meteo Earth  Weather App

A modern weather dashboard built with Next.js, React and Tailwind CSS. It uses Auth0 for authentication and displays city weather data with custom icons and responsive, accessible UI.

## Technologies

- Next.js (App Router)
- React 18
- Tailwind CSS
- Auth0 (@auth0/nextjs-auth0)
- Next/Image for optimized images
- FontAwesome & react-icons for vector icons
- Custom weather icons (in `public/weather-icons/`)

## Repository structure (important files)

- `src/app/`  Next.js App Router pages and layout
  - `login/page.js`  Login screen
  - `dashboard/page.js`  Dashboard (main app)
  - `layout.js`  Root layout & metadata
- `public/`  Static assets (bg.jpg, site-logo.png, weather-icons, etc.)
- `package.json`  scripts & dependencies
- `tailwind.config.*` / `postcss.config.*`  Tailwind setup (if present)

## Prerequisites

- Node.js (recommended 18.x or later)
- Yarn (or npm)

This repository uses Yarn in the examples below. On Windows PowerShell use the exact commands shown.

## Quick start (development)

1. Install dependencies

```powershell
yarn install
```

2. Copy environment variables

Create a `.env.local` at the project root with the Auth0 settings. Example:

```env
# .env.local (example)
AUTH0_SECRET="a_long_random_value_here"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://<your-auth0-domain>.auth0.com"
AUTH0_CLIENT_ID="your_auth0_client_id"
AUTH0_CLIENT_SECRET="your_auth0_client_secret"
```

Notes:
- Replace `<your-auth0-domain>` and the client credentials with values from your Auth0 tenant.
- `AUTH0_SECRET` should be a long random string; you can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

3. Run the dev server

```powershell
yarn dev
```

Open http://localhost:3000 in your browser.

## Build & production

Build the app and start the production server:

```powershell
yarn build
yarn start
```

Deploy to a platform (Vercel, Netlify) by following their Next.js deployment guides. For social previews and Open Graph images, ensure `public/site-logo.png` exists and set `metadataBase` in `src/app/layout.js` if you need absolute URLs.

## Environment variables (summary)

- AUTH0_SECRET  session encryption secret
- AUTH0_BASE_URL  e.g. `http://localhost:3000`
- AUTH0_ISSUER_BASE_URL  your Auth0 tenant (issuer)
- AUTH0_CLIENT_ID  Auth0 client id
- AUTH0_CLIENT_SECRET  Auth0 client secret

If you add other APIs (weather service), add their keys here and reference them in server code or via secure server-side config.

## Styling & assets

- Tailwind utilities are used across the app. If you change Tailwind config, re-run dev server.
- Background image is `public/bg.jpg` and site logo is `public/site-logo.png` (used for metadata). The `public/weather-icons/` folder contains SVG icons for weather states.

## Notes & troubleshooting

- If the login or dashboard behave oddly, confirm Auth0 env vars are correct and that the Auth0 application has the correct callback/allowed URLs (`http://localhost:3000/api/auth/callback` and logout `http://localhost:3000`).
- If metadata/social images don't show in previews, many preview services require absolute URLs and a deployed site. Use `metadataBase` in `src/app/layout.js` to set the production base URL.
- Tailwind class mismatches (e.g., `text-red` vs `text-red-500`) will not apply; use valid Tailwind utilities or update your Tailwind config.

## Development tips

- To test responsive behavior, use the browser's devtools and toggle device widths.
- The dashboard hides the username on small screens and shows a Logout button  you can change this behavior in `src/app/dashboard/page.js`.

