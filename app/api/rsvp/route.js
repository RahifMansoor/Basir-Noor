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
        const { name, phone, email, events, guests, notes } = await request.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: "Name is required." }, { status: 400 });
        }
        const sql = getDb();
        await ensureRsvpTable(sql);
        const [row] = await sql`
            INSERT INTO rsvps (
                name, name_lower, phone, email,
                dholki, mehndi, dua_e_khair, barat, welcome_dulhan, walima,
                guests, notes
            ) VALUES (
                ${name.trim()},
                ${name.trim().toLowerCase()},
                ${phone?.trim() || null},
                ${email?.trim() || null},
                ${events?.dholki         ?? false},
                ${events?.mehndi         ?? false},
                ${events?.dua_e_khair    ?? false},
                ${events?.barat          ?? false},
                ${events?.welcome_dulhan ?? false},
                ${events?.walima         ?? false},
                ${JSON.stringify(Array.isArray(guests) ? guests.filter(Boolean) : [])},
                ${notes?.trim() || null}
            )
            ON CONFLICT (name_lower) DO UPDATE SET
                name            = EXCLUDED.name,
                phone           = EXCLUDED.phone,
                email           = EXCLUDED.email,
                dholki          = EXCLUDED.dholki,
                mehndi          = EXCLUDED.mehndi,
                dua_e_khair     = EXCLUDED.dua_e_khair,
                barat           = EXCLUDED.barat,
                welcome_dulhan  = EXCLUDED.welcome_dulhan,
                walima          = EXCLUDED.walima,
                guests          = EXCLUDED.guests,
                notes           = EXCLUDED.notes,
                updated_at      = NOW()
            RETURNING *
        `;
        return NextResponse.json(row);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
