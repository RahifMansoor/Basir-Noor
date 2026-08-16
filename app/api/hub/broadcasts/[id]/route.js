import { NextResponse } from "next/server";
import { getDb, ensureHubBroadcastsTable } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function DELETE(request, { params }) {
    if (!isAdminAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    try {
        const sql = getDb();
        await ensureHubBroadcastsTable(sql);
        await sql`DELETE FROM hub_broadcasts WHERE id = ${id}`;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
