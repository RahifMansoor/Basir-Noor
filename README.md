# Basir & Noor Wedding Website

Multi-page, mobile-friendly static website ready for Vercel with:
- Home page (`/`)
- Details page (`/details`)
- RSVP page (`/rsvp`)
- Save-the-date scratch card page (`/save-the-date`)

## Deploy to Vercel
1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add environment variable in Vercel project settings:
   - `RSVP_WEBHOOK_URL` = your webhook endpoint that writes to your spreadsheet.
4. Redeploy.

## Spreadsheet/Excel Tracking Setup
Best practice is to route RSVP submissions from `/api/rsvp` to Excel using Power Automate:
1. Create an Excel file in OneDrive/SharePoint with a table (columns can be: `timestamp`, `parent_name`, `parent_email`, `parent_phone`, `attendance`, `additional_guest_count`, `additional_guests_json`, `notes`).
2. In Power Automate, create a flow:
   - Trigger: "When an HTTP request is received".
   - Action: "Add a row into a table" (Excel Online).
   - Map fields from the incoming JSON.
3. Copy the trigger URL from Power Automate and set it as `RSVP_WEBHOOK_URL` in Vercel.

## Optional Tracker Link
In `assets/js/rsvp.js`, change `TRACKER_URL` to your Excel Online share link so hosts can open the RSVP tracker from the website.

## Local Run
Open the HTML files directly or run any static server. Vercel is the intended deployment target.
