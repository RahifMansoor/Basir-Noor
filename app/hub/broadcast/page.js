import Link from "next/link";
import { getDb, ensureHubBroadcastsTable } from "@/lib/db";

export const metadata = { title: "Broadcast" };
export const dynamic = "force-dynamic";

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default async function HubBroadcastPage() {
    const sql = getDb();
    await ensureHubBroadcastsTable(sql);
    const broadcasts = await sql`
        SELECT id, title, message, created_at
        FROM hub_broadcasts
        ORDER BY created_at DESC
    `;

    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">The Hub</p>
                <h1>📣 Broadcast</h1>
                <p>Announcements and updates from the family.</p>
            </section>

            <section className="hub-section">
                <div className="hub-broadcast-list">
                    {broadcasts.map((b) => (
                        <article key={b.id} className="hub-broadcast-card">
                            <span className="hub-broadcast-date">{formatDate(b.created_at)}</span>
                            <h3>{b.title}</h3>
                            <p>{b.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            <div className="hub-back-link">
                <Link className="btn btn-outline" href="/hub">
                    ← Back to Hub
                </Link>
            </div>
        </div>
    );
}
