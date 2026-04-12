import Link from "next/link";

export default function EventTemplate({ event }) {
    return (
        <div className="content-page event-page">
            <section className="event-hero">
                <p className="eyebrow">{event.eyebrow}</p>
                <h1>{event.title}</h1>
                <p>{event.intro}</p>
                {event.heroMetaLocation && (
                    <div className="bp-date-location">
                        <span>{event.heroMetaDate || event.date}</span>
                        <span className="bp-date-dot">&middot;</span>
                        <span>{event.heroMetaLocation}</span>
                    </div>
                )}
            </section>

            {event.flyer && (
                <section className="event-flyer">
                    <img
                        className="event-flyer-img"
                        src={event.flyer}
                        alt={`${event.title} invitation`}
                        loading="lazy"
                    />
                </section>
            )}

            <section className="panel event-highlight">
                <h2>{event.title} Details</h2>
                <p>{event.note}</p>
                {event.notice && <div className="event-static-notice">{event.notice}</div>}

                {!event.hideActions && (
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
                )}
            </section>

            {event.featured && (
                <section className={`featured-artist${event.featuredLarge ? " featured-artist-large" : ""}`}>
                    <p className="eyebrow">Featuring</p>
                    <div className={`featured-card${event.featuredLarge ? " featured-card-large" : ""}`}>
                        <img
                            className={`featured-photo${event.featuredLarge ? " featured-photo-large" : ""}`}
                            src={event.featured.photo}
                            alt={event.featured.name}
                            loading="lazy"
                        />
                        <div className="featured-info">
                            <h3>{event.featured.name}</h3>
                            <p>{event.featured.label}</p>
                            <div className="featured-socials">
                                {event.featured.instagram && (
                                    <a
                                        className="featured-social-link"
                                        href={event.featured.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg className="featured-social-icon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
                                        </svg>
                                    </a>
                                )}
                                {event.featured.youtube && (
                                    <a
                                        className="featured-social-link"
                                        href={event.featured.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg className="featured-social-icon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="details-grid">
                <article className="detail-card">
                    <span className="card-icon">📅</span>
                    <h2>Date</h2>
                    <p className="detail-card-multiline">{event.date}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">📍</span>
                    <h2>Location</h2>
                    <p>{event.location}</p>
                    {event.locationImage && (
                        <a
                            className="detail-card-media-link"
                            href={event.locationMapUrl || event.locationImage}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className="detail-card-media"
                                src={event.locationImage}
                                alt={event.locationImageAlt || `${event.title} location`}
                                loading="lazy"
                            />
                        </a>
                    )}
                    {event.locationMapUrl && (
                        <p>
                            <a
                                className="detail-card-link"
                                href={event.locationMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Google Maps
                            </a>
                        </p>
                    )}
                </article>

                <article className="detail-card">
                    <span className="card-icon">{event.dressCodeIcon || "🥻"}</span>
                    <h2>Dress Code</h2>
                    <p>{event.dressCode}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">✨</span>
                    <h2>Mood</h2>
                    <p>{event.mood}</p>
                </article>

                {event.timeline ? (
                    <article className="detail-card detail-card-wide event-timeline-card">
                        <span className="card-icon">🕐</span>
                        <h2>Evening Timeline</h2>
                        <ol className="event-timeline">
                            {event.timeline.map((item, i) => (
                                <li key={i} className="timeline-item">
                                    <span className="timeline-dot" />
                                    <span className="timeline-time">{item.time}</span>
                                    <div className="timeline-content">
                                        <strong>{item.title}</strong>
                                        {item.desc && <p>{item.desc}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </article>
                ) : event.activities && (
                    <article className="detail-card detail-card-wide">
                        <span className="card-icon">🎉</span>
                        <h2>Activities</h2>
                        <ul className="event-activities">
                            {event.activities.map((activity) => (
                                <li key={activity}>{activity}</li>
                            ))}
                        </ul>
                    </article>
                )}
            </section>
        </div>
    );
}
