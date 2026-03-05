import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const payload = await request.json();
        const webhookUrl = process.env.RSVP_WEBHOOK_URL;

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "RSVP_WEBHOOK_URL is not set." },
                { status: 500 }
            );
        }

        const upstream = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: "Failed to sync RSVP to spreadsheet." },
                { status: 502 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Unexpected server error", details: error.message },
            { status: 500 }
        );
    }
}

// Reject non-POST
export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "POST" } }
    );
}
