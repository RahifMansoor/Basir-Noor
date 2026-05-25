import { NextResponse } from "next/server";
import { getDb, ensureTable } from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "baat-pakki";
        const sql = getDb();
        await ensureTable(sql);
        const rows = await sql`
            SELECT id, name, comment, created_at
            FROM bp_comments
            WHERE page = ${page}
            ORDER BY created_at DESC
        `;
        return NextResponse.json(rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, comment, page = "baat-pakki" } = await request.json();

        if (!name?.trim() || !comment?.trim()) {
            return NextResponse.json(
                { error: "Name and comment are required." },
                { status: 400 }
            );
        }

        if (name.trim().length > 80 || comment.trim().length > 1000) {
            return NextResponse.json(
                { error: "Name must be under 80 chars; comment under 1000 chars." },
                { status: 400 }
            );
        }

        const sql = getDb();
        await ensureTable(sql);
        const [row] = await sql`
            INSERT INTO bp_comments (name, comment, page)
            VALUES (${name.trim()}, ${comment.trim()}, ${page})
            RETURNING id, name, comment, created_at
        `;
        return NextResponse.json(row, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
