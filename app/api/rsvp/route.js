import { NextResponse } from "next/server";
import { getDb, ensureRsvpTable } from "@/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim();
    if (!name) {
        return NextResponse.json({ error: "Name query param is required." }, { status: 400 });
    }
    try {
        const sql = getDb();
        await ensureRsvpTable(sql);
        const rows = await sql`
            SELECT * FROM rsvps WHERE name_lower = ${name.toLowerCase()}
        `;
        return NextResponse.json(rows[0] ?? null);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, phone, email, events, guests, notes, unableEvents } = await request.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: "Name is required." }, { status: 400 });
        }
        const sql = getDb();
        await ensureRsvpTable(sql);
        // Store unableEvents inside the guests JSONB under _unable to avoid a schema migration
        const guestsPayload = { ...(guests ?? {}), _unable: unableEvents ?? {} };
        const [row] = await sql`
            INSERT INTO rsvps (
                name, name_lower, phone, email,
                welcome_dulhan, barat, walima,
                mehndi, dua_e_khair,
                guests, notes
            ) VALUES (
                ${name.trim()},
                ${name.trim().toLowerCase()},
                ${phone?.trim() || null},
                ${email?.trim() || null},
                ${events?.dholki    ?? false},
                ${events?.barat     ?? false},
                ${events?.walima    ?? false},
                ${events?.mehndi    ?? false},
                ${events?.duaEKhair ?? false},
                ${JSON.stringify(guestsPayload)},
                ${notes?.trim() || null}
            )
            ON CONFLICT (name_lower) DO UPDATE SET
                name           = EXCLUDED.name,
                phone          = EXCLUDED.phone,
                email          = EXCLUDED.email,
                welcome_dulhan = EXCLUDED.welcome_dulhan,
                barat          = EXCLUDED.barat,
                walima         = EXCLUDED.walima,
                mehndi         = EXCLUDED.mehndi,
                dua_e_khair    = EXCLUDED.dua_e_khair,
                guests         = EXCLUDED.guests,
                notes          = EXCLUDED.notes,
                updated_at     = NOW()
            RETURNING *
        `;
        return NextResponse.json(row);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
