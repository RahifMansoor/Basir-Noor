import Link from "next/link";

export default function HomePage() {
    return (
        <>
            <section className="hero">
                <h1> Mansoor Family</h1>
                <p className="subtitle">
                    Humbly request the honor of your presence as they begin forever.
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
                </div>
            </section>

            <section className="panel-grid">
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
            </section>
        </>
    );
}
