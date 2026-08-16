import { NextResponse } from "next/server";
import { getDb, ensureHubBroadcastsTable } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function GET() {
    try {
        const sql = getDb();
        await ensureHubBroadcastsTable(sql);
        const rows = await sql`
            SELECT id, title, message, created_at
            FROM hub_broadcasts
            ORDER BY created_at DESC
        `;
        return NextResponse.json(rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
        const { title, message } = await request.json();

        if (!title?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "Title and message are required." },
                { status: 400 }
            );
        }

        if (title.trim().length > 120 || message.trim().length > 1000) {
            return NextResponse.json(
                { error: "Title must be under 120 chars; message under 1000 chars." },
                { status: 400 }
            );
        }

        const sql = getDb();
        await ensureHubBroadcastsTable(sql);
        const [row] = await sql`
            INSERT INTO hub_broadcasts (title, message)
            VALUES (${title.trim()}, ${message.trim()})
            RETURNING id, title, message, created_at
        `;
        return NextResponse.json(row, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
