# Wedding Website — Development Guide

## Tech Stack

- **Next.js 16** (App Router) — no Pages Router
- **React 19** — hooks only, no class components
- **Pure vanilla CSS** — all styles in `app/globals.css`, no Tailwind, no CSS Modules, no styled-components
- **Vercel** deployment, Power Automate webhook for RSVP

## Project Structure

```
app/                  # Next.js App Router pages
  globals.css         # Single source of truth for all styles (2000+ lines)
  layout.js           # Root layout: wraps every page with Header + Footer
  page.js             # Home page
  [event]/page.js     # One folder per wedding event
  api/rsvp/route.js   # Serverless RSVP webhook proxy
components/
  Header.js           # Sticky nav — uses usePathname() for active state
  Footer.js           # Context-aware footer messages
  EventTemplate.js    # Reusable template for standard event pages
data/
  eventDetails.js     # Single source of truth for all event metadata
public/
  audio/              # Background music files
  images/[event]/     # Per-event photos
```

## Design System

All CSS variables live in `app/globals.css` (lines 1–25). Never hardcode colors or radii.

```css
/* Colors */
--bg: #fdf0f4          --bg-deep: #f0e8da
--ink: #2a1f18         --muted: #6f5a4d
--gold: #d6ad4f        --gold-dark: #a57a24
--gold-glow: rgba(214,173,79,0.25)
--card: #fffdf9        --card-hover: #fff9f0
--border: rgba(42,31,24,0.12)
--border-strong: rgba(42,31,24,0.22)

/* Spacing / Shape */
--radius-sm: 12px   --radius-md: 20px
--radius-lg: 28px   --radius-pill: 999px

/* Shadows */
--shadow: 0 16px 42px rgba(42,31,24,0.14)
--shadow-lg: 0 28px 64px rgba(42,31,24,0.18)

/* Transitions */
--transition-fast: 0.2s ease
--transition-med: 0.35s cubic-bezier(0.4,0,0.2,1)
--transition-slow: 0.6s cubic-bezier(0.4,0,0.2,1)

/* Typography */
--font-serif: "Cormorant Garamond", serif   /* headings, elegant text */
--font-sans: "Montserrat", sans-serif        /* body, nav, inputs */
```

Use `clamp()` for fluid typography: `clamp(1.4rem, 3vw, 2.2rem)`.

## Adding a New Event Page

1. Add the event object to `data/eventDetails.js` following the existing schema.
2. Create `app/[event-slug]/page.js` — most pages are just:

```js
import EventTemplate from "@/components/EventTemplate";
import { events } from "@/data/eventDetails";

export default function MyEventPage() {
  return <EventTemplate event={events.myEvent} />;
}
```

3. Add images to `public/images/[event-slug]/`.
4. Add a nav link in `components/Header.js` if the page needs navigation visibility.

For pages needing special interactions (gallery, canvas, animations), build page-specific client components with `"use client"` at the top.

## CSS Conventions

- **Class naming**: BEM-lite scoped to the feature — `.event-hero`, `.bp-gallery-item`, `.rsvp-form`
- **Event-specific prefixes**: `bp-` (baat-pakki), `std-` (save-the-date), etc.
- **State classes**: `.active`, `.ready`, `.hidden`, `.disabled`
- **All new styles go in `globals.css`** under a clearly labeled section comment: `/* ---------- section name ---------- */`
- Breakpoints: `@media (max-width: 800px)` and `@media (max-width: 480px)` only
- Animate with CSS keyframes defined at the bottom of `globals.css`; use inline CSS variables for per-element randomness

## Animation Patterns

Per-element randomness via inline style + CSS variable:

```jsx
<div
  className="details-petal"
  style={{
    "--petal-size": `${size}px`,
    "--petal-duration": `${duration}s`,
    "--petal-delay": `${delay}s`,
    "--petal-drift-x": `${driftX}px`,
  }}
/>
```

Then in CSS:
```css
.details-petal {
  width: var(--petal-size);
  animation: petalFall var(--petal-duration) var(--petal-delay) ease-in infinite;
}
```

## Component Rules

- **Client-only interactions** → `"use client"` at the top of the file
- **EventTemplate** handles hero, flyer, details cards, artist block, timeline — extend it before making one-off copies
- **Header** hides nav on `/save-the-date`, `/baat-pakki`, `/barat-save-the-date` — update that allowlist when adding immersive pages
- **Footer** picks message by pathname — update the map in `Footer.js` for new pages

## Do Not

- Do not install UI libraries (no Radix, no shadcn, no Chakra, no MUI)
- Do not use Tailwind or CSS Modules — all styles in `globals.css`
- Do not hardcode `#d6ad4f` or any token value — use the CSS variable
- Do not create new components for single-use JSX; prefer inline JSX in the page file
- Do not add `console.log` outside of debugging sessions
- Do not use `pages/` directory — this project uses the App Router only

## RSVP / Backend

- API route: `app/api/rsvp/route.js` proxies to Power Automate webhook
- Webhook URL stored in `process.env.RSVP_WEBHOOK_URL` (set in Vercel env vars)
- Never commit secrets or `.env` files

## Running Locally

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
npm run start  # serve production build
```
