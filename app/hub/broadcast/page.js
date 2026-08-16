import Link from "next/link";
import { broadcasts } from "@/data/hubData";

export const metadata = { title: "Broadcast" };

export default function HubBroadcastPage() {
    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">The Hub</p>
                <h1>📣 Broadcast</h1>
                <p>Announcements and updates from the family.</p>
            </section>

            <section className="hub-section">
                <div className="hub-broadcast-list">
                    {broadcasts.map((b, i) => (
                        <article key={i} className="hub-broadcast-card">
                            <span className="hub-broadcast-date">{b.date}</span>
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
