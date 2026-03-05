# Basir & Noor Wedding Website

A premium, modern wedding website built with **Next.js** (App Router) and deployed on Vercel.

## Pages

- **Home** (`/`) — Hero section with CTA and wedding info panels
- **Details** (`/details`) — Venue, schedule, dress code, and accommodations
- **RSVP** (`/rsvp`) — Interactive form with dynamic guest fields
- **Save the Date** (`/save-the-date`) — Scratch-to-reveal card with rose petal animations, countdown, and background music

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** with hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- **Vanilla CSS** with design tokens, glassmorphism, and micro-animations
- **Route Handlers** for API endpoints

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add environment variable in Vercel project settings:
   - `RSVP_WEBHOOK_URL` = your webhook endpoint that writes to your spreadsheet.
4. Deploy — Next.js is auto-detected.

## Spreadsheet/Excel Tracking Setup

Route RSVP submissions from `/api/rsvp` to Excel using Power Automate:

1. Create an Excel file in OneDrive/SharePoint with a table (columns: `timestamp`, `parent_name`, `parent_email`, `parent_phone`, `attendance`, `additional_guest_count`, `additional_guests_json`, `notes`).
2. In Power Automate, create a flow:
   - Trigger: "When an HTTP request is received".
   - Action: "Add a row into a table" (Excel Online).
   - Map fields from the incoming JSON.
3. Copy the trigger URL from Power Automate and set it as `RSVP_WEBHOOK_URL` in Vercel.

## Project Structure

```
├── app/
│   ├── api/rsvp/route.js     # RSVP webhook proxy
│   ├── details/page.js       # Wedding details page
│   ├── rsvp/
│   │   ├── layout.js         # RSVP metadata
│   │   └── page.js           # RSVP form (client component)
│   ├── save-the-date/
│   │   ├── layout.js         # Save the date metadata
│   │   └── page.js           # Scratch card (client component)
│   ├── globals.css            # Design system & styles
│   ├── layout.js              # Root layout (header/footer)
│   └── page.js                # Home page
├── components/
│   ├── Header.js              # Sticky nav with active link detection
│   └── Footer.js              # Dynamic contextual footer
├── public/
│   └── audio/tum-hi-ho.mp3   # Background music
├── next.config.mjs
└── package.json
```
