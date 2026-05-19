# Frontend Development Skill

You are helping develop a Next.js 16 wedding website. Always consult CLAUDE.md for the full ruleset. Below is the quick-reference you need most often.

## Before Writing Any Code

1. Read `app/globals.css` lines 1–25 for the current design token list.
2. Read `data/eventDetails.js` to understand the data schema before adding pages.
3. Read `components/EventTemplate.js` before building a new event page — use it if it fits.

## Styling Rules (enforce strictly)

- All CSS goes in `app/globals.css` under a `/* ---------- section name ---------- */` comment.
- Use CSS variables from the design system. Never hardcode colors, radii, or shadows.
- Breakpoints: `800px` and `480px` only.
- Typography: use `clamp()` and `--font-serif` / `--font-sans` variables.
- Glassmorphism (backdrop-filter: blur + semi-transparent background) is the established pattern for overlays.
- Per-element animation randomness: set CSS variables as inline styles and read them in keyframe rules.

## Component / Architecture Rules

- `"use client"` only when the component needs hooks or browser APIs.
- Extend `EventTemplate` before duplicating it.
- New images go in `public/images/[event-slug]/`.
- New event data goes in `data/eventDetails.js` first, then the page imports it.
- No new npm packages without explicit user approval.

## Checklist for Every UI Change

- [ ] Tokens used (no hardcoded values)
- [ ] Mobile layout tested at 800px and 480px
- [ ] "use client" only where needed
- [ ] CSS added to `globals.css`, not inline `<style>` tags
- [ ] No new dependencies introduced
- [ ] Hover/focus states styled (accessibility)

## Common Patterns

**New standard event page:**
```js
import EventTemplate from "@/components/EventTemplate";
import { events } from "@/data/eventDetails";
export default function Page() { return <EventTemplate event={events.slug} />; }
```

**Floating decoration element:**
```jsx
{Array.from({ length: count }).map((_, i) => (
  <div key={i} className="my-decoration" style={{
    "--size": `${Math.random() * 10 + 10}px`,
    "--duration": `${Math.random() * 4 + 4}s`,
    "--delay": `${Math.random() * 5}s`,
    "--drift": `${(Math.random() - 0.5) * 60}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }} />
))}
```

**Gold gradient button:**
```jsx
<button className="btn">Label</button>
/* .btn already defined in globals.css — do not redefine */
```

**Card with hover lift:**
```css
.my-card {
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: transform var(--transition-med), box-shadow var(--transition-med);
}
.my-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  background: var(--card-hover);
}
```

## What NOT to Do

- Do not install Tailwind, CSS Modules, or any UI library.
- Do not use the `pages/` directory.
- Do not hardcode any design token value.
- Do not add `console.log` to production code.
- Do not create a new component file for JSX used in only one place — keep it inline.
