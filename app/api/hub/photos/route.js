import { NextResponse } from "next/server";
import { getDb, ensureHubPhotosTable } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

const MAX_BASE64_LENGTH = 6_000_000; // ~4.5MB decoded per photo
const MAX_BATCH_SIZE = 10;
const IMAGE_DATA_RE = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/;
const CATEGORIES = ["gallery", "dream-team"];

export async function GET(request) {
    try {
        const sql = getDb();
        await ensureHubPhotosTable(sql);
        const { searchParams } = new URL(request.url);
        const category = CATEGORIES.includes(searchParams.get("category"))
            ? searchParams.get("category")
            : "gallery";
        const rows = await sql`
            SELECT id, name, caption, batch_id, created_at
            FROM hub_photos
            WHERE category = ${category}
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
        const { name, caption, images, batchId, category } = await request.json();

        if (!Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: "At least one photo is required." },
                { status: 400 }
            );
        }

        if ((name && name.trim().length > 80) || (caption && caption.trim().length > 300)) {
            return NextResponse.json(
                { error: "Name must be under 80 chars; caption under 300 chars." },
                { status: 400 }
            );
        }

        if (images.length > MAX_BATCH_SIZE) {
            return NextResponse.json(
                { error: `You can upload up to ${MAX_BATCH_SIZE} photos at once.` },
                { status: 400 }
            );
        }

        const decoded = [];
        for (const image of images) {
            const match = IMAGE_DATA_RE.exec(image);
            if (!match) {
                return NextResponse.json(
                    { error: "Unsupported image format." },
                    { status: 400 }
                );
            }
            const [, contentType, base64Data] = match;
            if (base64Data.length > MAX_BASE64_LENGTH) {
                return NextResponse.json(
                    { error: "One of the photos is too large. Please try a smaller image." },
                    { status: 400 }
                );
            }
            decoded.push({ contentType, base64Data });
        }

        const sql = getDb();
        await ensureHubPhotosTable(sql);

        const trimmedName = name?.trim() || null;
        const trimmedCaption = caption?.trim() || null;
        const finalBatchId = typeof batchId === "string" && batchId.trim() ? batchId.trim() : crypto.randomUUID();
        const finalCategory = CATEGORIES.includes(category) ? category : "gallery";

        const rows = [];
        for (const { contentType, base64Data } of decoded) {
            const [row] = await sql`
                INSERT INTO hub_photos (name, caption, content_type, image_data, batch_id, category)
                VALUES (${trimmedName}, ${trimmedCaption}, ${contentType}, ${base64Data}, ${finalBatchId}, ${finalCategory})
                RETURNING id, name, caption, batch_id, created_at
            `;
            rows.push(row);
        }

        return NextResponse.json(rows, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
