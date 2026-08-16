import Link from "next/link";
import { dreamTeam } from "@/data/hubData";

export const metadata = { title: "Dream Team" };

export default function HubDreamTeamPage() {
    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">The Hub</p>
                <h1>🌟 Dream Team</h1>
                <p>Meet the day-of contacts and helpers.</p>
            </section>

            <section className="hub-section">
                <div className="hub-team-grid">
                    {dreamTeam.map((m, i) => (
                        <article key={i} className="hub-team-card">
                            <h3>{m.name}</h3>
                            <p className="hub-team-role">{m.role}</p>
                            {m.contact && <p className="hub-team-contact">{m.contact}</p>}
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
