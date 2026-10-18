# Playlist

A music playlist app backed by Google Sheets. Manage songs with rich metadata, custom fields, faceted filtering, and shareable public playlists.

## Setup

### 1. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Go to **APIs & Services > Credentials**
5. Create an **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5173` (dev) and your production URL
   - Authorized redirect URIs: same as origins
6. Create an **API Key** (used for public playlist viewing)
   - Restrict it to Google Sheets API only
7. Go to **OAuth consent screen**:
   - Add scopes: `spreadsheets`, `drive.file`
   - For testing: add your email as a test user
   - For production: submit for verification

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Multiple playlists** — each stored as its own Google Spreadsheet
- **Rich metadata** — name, vocalist, tags, links per song
- **Custom fields** — add your own metadata keys in Settings (e.g. Mood, Genre, BPM)
- **Multi-value fields** — tags, vocalists, and custom fields support multiple values
- **Faceted filtering** — filter by any metadata field, search by name
- **Public playlists** — share a read-only link with anyone
- **Dark/Light/System theme**
- **Mobile-friendly** — responsive design with touch-optimized UI

## For Other Users

Other users just sign in with their Google account — they don't need their own Google Cloud project. The OAuth consent screen is shared. Make sure to:

1. Publish the OAuth consent screen (or add them as test users during development)
2. Deploy the app to a public URL
3. Add the production URL to the OAuth client's authorized origins

## Deploy

```bash
npm run build
```

The `dist/` folder is a static site. Deploy to Vercel, Netlify, GitHub Pages, or any static host. Make sure to configure SPA routing (all paths serve `index.html`).
