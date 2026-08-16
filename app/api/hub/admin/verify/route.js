import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function POST(request) {
    if (!isAdminAuthorized(request)) {
        return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
}
