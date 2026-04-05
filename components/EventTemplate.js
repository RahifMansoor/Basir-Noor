import Link from "next/link";

export default function EventTemplate({ event }) {
    return (
        <div className="content-page event-page">
            <section className="event-hero">
                <p className="eyebrow">{event.eyebrow}</p>
                <h1>{event.title}</h1>
                <p>{event.intro}</p>
            </section>

            <section className="panel event-highlight">
                <h2>{event.title} Details</h2>
                <p>{event.note}</p>

                <div className="event-actions">
                    {event.rsvpEnabled ? (
                        <Link className="btn" href="/rsvp">
                            RSVP Now
                        </Link>
                    ) : (
                        <button className="btn btn-disabled" type="button" disabled>
                            RSVP Coming Soon
                        </button>
                    )}
                    <Link className="btn btn-outline" href="/">
                        Back Home
                    </Link>
                </div>
            </section>

            <section className="details-grid">
                <article className="detail-card">
                    <span className="card-icon">📅</span>
                    <h2>Date</h2>
                    <p>{event.date}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">📍</span>
                    <h2>Location</h2>
                    <p>{event.location}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">👗</span>
                    <h2>Dress Code</h2>
                    <p>{event.dressCode}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">✨</span>
                    <h2>Mood</h2>
                    <p>{event.mood}</p>
                </article>

                <article className="detail-card detail-card-wide">
                    <span className="card-icon">🎉</span>
                    <h2>Activities</h2>
                    <ul className="event-activities">
                        {event.activities.map((activity) => (
                            <li key={activity}>{activity}</li>
                        ))}
                    </ul>
                </article>
            </section>
        </div>
    );
}
