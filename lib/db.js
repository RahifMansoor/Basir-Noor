import { neon } from "@neondatabase/serverless";

export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is not set.");
    }
    return neon(process.env.DATABASE_URL);
}

export async function ensureTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS bp_comments (
            id         SERIAL PRIMARY KEY,
            name       TEXT NOT NULL,
            comment    TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    await sql`ALTER TABLE bp_comments ADD COLUMN IF NOT EXISTS page TEXT NOT NULL DEFAULT 'baat-pakki'`;
}

export async function ensureRsvpTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS rsvps (
            id              SERIAL PRIMARY KEY,
            name            TEXT NOT NULL,
            name_lower      TEXT NOT NULL UNIQUE,
            phone           TEXT,
            email           TEXT,
            welcome_dulhan  BOOLEAN NOT NULL DEFAULT FALSE,
            mehndi          BOOLEAN NOT NULL DEFAULT FALSE,
            dua_e_khair     BOOLEAN NOT NULL DEFAULT FALSE,
            barat           BOOLEAN NOT NULL DEFAULT FALSE,
            walima          BOOLEAN NOT NULL DEFAULT FALSE,
            guests          JSONB NOT NULL DEFAULT '[]',
            notes           TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guests JSONB NOT NULL DEFAULT '[]'`;
    await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS unable_to_attend BOOLEAN NOT NULL DEFAULT FALSE`;
}

export async function ensureHubPhotosTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS hub_photos (
            id           SERIAL PRIMARY KEY,
            name         TEXT,
            caption      TEXT,
            content_type TEXT NOT NULL,
            image_data   TEXT NOT NULL,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    await sql`ALTER TABLE hub_photos ADD COLUMN IF NOT EXISTS batch_id TEXT`;
    await sql`ALTER TABLE hub_photos ALTER COLUMN name DROP NOT NULL`;
    await sql`ALTER TABLE hub_photos ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'gallery'`;
}

export async function ensureHubBroadcastsTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS hub_broadcasts (
            id         SERIAL PRIMARY KEY,
            title      TEXT NOT NULL,
            message    TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    await sql`
        INSERT INTO hub_broadcasts (title, message)
        SELECT 'Welcome to the Hub!',
               'This is our space for announcements, meeting the team behind the scenes, and sharing photos with everyone. Check back for updates as the big day gets closer.'
        WHERE NOT EXISTS (SELECT 1 FROM hub_broadcasts)
    `;
}
