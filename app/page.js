import Link from "next/link";

export default function HomePage() {
    return (
        <>
            <section className="hero">
                <div className="hero-dua">
                    <p className="hero-dua-arabic">وَخَلَقْنَاكُمْ أَزْوَاجًا</p>
                    <p className="hero-dua-reference">Qur'an 78:8</p>
                </div>
                <h1 className="hero-family">Mansoor Family</h1>
                <p className="subtitle">
                    Humbly request the honor of your presence as they begin their forever
                </p>
                <h1>
                    Basir <span>&</span> Noor
                </h1>

                <div className="cta-group">
                    <Link className="btn" href="/rsvp">
                        RSVP Now
                    </Link>
                    <Link className="btn btn-outline" href="/save-the-date">
                        View Save The Date
                    </Link>
                    {/* <Link className="btn btn-outline" href="/dua-e-khair">
                        Dua E Khair
                    </Link> */}
                </div>
            </section>

            {/* <section className="panel-grid">
                <article className="panel">
                    <h2>Walima Date</h2>
                    <p>October 18, 2026</p>
                </article>
                <article className="panel">
                    <h2>Location</h2>
                    <p>Venue details and travel notes on the Details page.</p>
                </article>
                <article className="panel">
                    <h2>Your Invitation</h2>
                    <p>Please RSVP and include details for all additional guests.</p>
                </article>
            </section> */}
{/* 
            <section className="event-links-section">
                <div className="event-links-header">
                    <p className="eyebrow">Wedding Events</p>
                    <h2>Explore Each Celebration</h2>
                    <p>
                        Template pages are ready for each event and can be filled
                        in with final timings, venue details, RSVP flow, and
                        dress code updates later.
                    </p>
                </div>

                <div className="event-link-grid">
                    {eventLinks.map((event) => (
                        <article className="event-link-card" key={event.slug}>
                            <p className="event-link-kicker">{event.eyebrow}</p>
                            <h3>{event.title}</h3>
                            <p>{event.mood}</p>
                            <Link className="btn btn-outline" href={`/${event.slug}`}>
                                View {event.title}
                            </Link>
                        </article>
                    ))}
                </div>
            </section> */}
        </>
    );
}
