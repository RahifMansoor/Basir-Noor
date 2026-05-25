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
            dholki          BOOLEAN NOT NULL DEFAULT FALSE,
            mehndi          BOOLEAN NOT NULL DEFAULT FALSE,
            dua_e_khair     BOOLEAN NOT NULL DEFAULT FALSE,
            barat           BOOLEAN NOT NULL DEFAULT FALSE,
            welcome_dulhan  BOOLEAN NOT NULL DEFAULT FALSE,
            walima          BOOLEAN NOT NULL DEFAULT FALSE,
            guests          JSONB NOT NULL DEFAULT '[]',
            notes           TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    await sql`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guests JSONB NOT NULL DEFAULT '[]'`;
}
