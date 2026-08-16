import { NextResponse } from "next/server";
import { getDb, ensureHubPhotosTable } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

const MAX_BASE64_LENGTH = 6_000_000; // ~4.5MB decoded
const IMAGE_DATA_RE = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/;

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

export async function PATCH(request, { params }) {
    if (!isAdminAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { name, caption, image } = await request.json();

        const sets = [];
        const sql = getDb();
        await ensureHubPhotosTable(sql);

        if (name !== undefined) {
            const trimmed = name.trim();
            if (!trimmed || trimmed.length > 80) {
                return NextResponse.json({ error: "Name must be 1-80 characters." }, { status: 400 });
            }
            await sql`UPDATE hub_photos SET name = ${trimmed} WHERE id = ${id}`;
            sets.push("name");
        }

        if (caption !== undefined) {
            const trimmed = caption.trim();
            if (trimmed.length > 300) {
                return NextResponse.json({ error: "Caption must be under 300 chars." }, { status: 400 });
            }
            await sql`UPDATE hub_photos SET caption = ${trimmed || null} WHERE id = ${id}`;
            sets.push("caption");
        }

        if (image !== undefined) {
            const match = IMAGE_DATA_RE.exec(image);
            if (!match) {
                return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
            }
            const [, contentType, base64Data] = match;
            if (base64Data.length > MAX_BASE64_LENGTH) {
                return NextResponse.json({ error: "Photo is too large. Please try a smaller image." }, { status: 400 });
            }
            await sql`UPDATE hub_photos SET content_type = ${contentType}, image_data = ${base64Data} WHERE id = ${id}`;
            sets.push("image");
        }

        if (sets.length === 0) {
            return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
        }

        const [row] = await sql`
            SELECT id, name, caption, batch_id, created_at
            FROM hub_photos
            WHERE id = ${id}
        `;
        if (!row) {
            return NextResponse.json({ error: "Photo not found." }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
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
