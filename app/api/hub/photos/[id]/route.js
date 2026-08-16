import { NextResponse } from "next/server";
import { getDb, ensureHubPhotosTable } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const sql = getDb();
        await ensureHubPhotosTable(sql);
        const [row] = await sql`
            SELECT content_type, image_data
            FROM hub_photos
            WHERE id = ${id}
        `;

        if (!row) {
            return new Response("Not found", { status: 404 });
        }

        const buffer = Buffer.from(row.image_data, "base64");
        return new Response(buffer, {
            headers: {
                "Content-Type": row.content_type,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    if (!isAdminAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    try {
        const sql = getDb();
        await ensureHubPhotosTable(sql);
        await sql`DELETE FROM hub_photos WHERE id = ${id}`;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
