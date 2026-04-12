const venueMapUrl =
    "https://www.google.com/maps/dir/?api=1&destination=2621+W+Eldorado+Pkwy,+Little+Elm,+TX+75068";

// Add a local venue photo later, for example: /images/details/knotting-hill-place.jpg
const venueImage = "/images/details/knotting-hill-place.jpg";
const petals = [
    { left: "3%", top: "6%", size: "12px", delay: "0s", duration: "17s", driftX: "18vw", driftY: "20vh" },
    { left: "10%", top: "26%", size: "15px", delay: "2.1s", duration: "15s", driftX: "-14vw", driftY: "16vh" },
    { left: "18%", top: "62%", size: "13px", delay: "0.9s", duration: "18s", driftX: "20vw", driftY: "-18vh" },
    { left: "24%", top: "14%", size: "17px", delay: "4s", duration: "16s", driftX: "16vw", driftY: "28vh" },
    { left: "31%", top: "44%", size: "11px", delay: "1.3s", duration: "14s", driftX: "-18vw", driftY: "14vh" },
    { left: "39%", top: "10%", size: "16px", delay: "3.6s", duration: "19s", driftX: "12vw", driftY: "30vh" },
    { left: "46%", top: "58%", size: "14px", delay: "0.5s", duration: "16.5s", driftX: "-20vw", driftY: "-16vh" },
    { left: "52%", top: "22%", size: "18px", delay: "2.8s", duration: "18s", driftX: "22vw", driftY: "18vh" },
    { left: "58%", top: "76%", size: "13px", delay: "1.2s", duration: "15.5s", driftX: "-16vw", driftY: "-22vh" },
    { left: "64%", top: "36%", size: "12px", delay: "4.2s", duration: "17.5s", driftX: "19vw", driftY: "22vh" },
    { left: "71%", top: "12%", size: "15px", delay: "0.8s", duration: "16s", driftX: "-13vw", driftY: "26vh" },
    { left: "78%", top: "52%", size: "17px", delay: "3.1s", duration: "18.5s", driftX: "15vw", driftY: "-18vh" },
    { left: "84%", top: "24%", size: "12px", delay: "1.7s", duration: "14.5s", driftX: "-17vw", driftY: "18vh" },
    { left: "90%", top: "68%", size: "14px", delay: "3.8s", duration: "17s", driftX: "12vw", driftY: "-16vh" },
    { left: "96%", top: "16%", size: "16px", delay: "0.3s", duration: "19s", driftX: "-11vw", driftY: "24vh" },
    { left: "8%", top: "84%", size: "13px", delay: "2.6s", duration: "15.8s", driftX: "18vw", driftY: "-20vh" },
];

export default function DetailsPage() {
    return (
        <div className="details-romance-shell">
            <div className="details-floral-frame" aria-hidden="true">
                <div className="details-floral-cluster details-floral-cluster-tl">
                    <span className="details-rose details-rose-large">🌸</span>
                    <span className="details-rose details-rose-medium">🌸</span>
                    <span className="details-bud details-bud-one">🌸</span>
                    <span className="details-bud details-bud-two">🌸</span>
                </div>
                <div className="details-floral-cluster details-floral-cluster-tr">
                    <span className="details-rose details-rose-large">🌸</span>
                    <span className="details-rose details-rose-medium">🌸</span>
                    <span className="details-bud details-bud-one">🌸</span>
                    <span className="details-bud details-bud-two">🌸</span>
                </div>
                <div className="details-floral-cluster details-floral-cluster-bl">
                    <span className="details-rose details-rose-large">🌸</span>
                    <span className="details-rose details-rose-medium">🌸</span>
                    <span className="details-bud details-bud-one">🌸</span>
                    <span className="details-bud details-bud-two">🌸</span>
                </div>
                <div className="details-floral-cluster details-floral-cluster-br">
                    <span className="details-rose details-rose-large">🌸</span>
                    <span className="details-rose details-rose-medium">🌸</span>
                    <span className="details-bud details-bud-one">🌸</span>
                    <span className="details-bud details-bud-two">🌸</span>
                </div>
            </div>

            <div className="details-petal-layer" aria-hidden="true">
                {petals.map((petal, index) => (
                    <span
                        key={index}
                        className="details-petal"
                        style={{
                            left: petal.left,
                            top: petal.top,
                            "--petal-size": petal.size,
                            "--petal-delay": petal.delay,
                            "--petal-duration": petal.duration,
                            "--petal-drift-x": petal.driftX,
                            "--petal-drift-y": petal.driftY,
                        }}
                    >
                        🌸
                    </span>
                ))}
            </div>

            <div className="content-page event-page details-page-content">
                <section className="event-hero">
                    <p className="eyebrow">Walima Celebration</p>
                    <h1>Walima Details</h1>
                    <p>Everything you need to know for our Walima celebration at Knotting Hill Place.</p>
                    <div className="bp-date-location">
                        <span>October 18th, 2026 Sunday, 5:30 PM Onwards</span>
                        <span className="bp-date-dot">&middot;</span>
                        <span>Little Elm, TX</span>
                    </div>
                </section>

                <section className="panel event-highlight">
                    <h2>Walima Celebration</h2>
                    <p>
                         Basir & Noor's Walima will be an evening of gratitude, joy, and togetherness as we celebrate
                        this new chapter with family and friends.
                    </p>
                    <div className="event-static-notice">RSVP and Formal Invite coming soon</div>
                </section>

                <section className="details-grid">
                    <article className="detail-card">
                        <span className="card-icon">📅</span>
                        <h2>Date & Time</h2>
                        <p className="detail-card-multiline">October 18th, 2026{"\n"}Formal program details to follow.</p>
                    </article>

                    <article className="detail-card">
                        <span className="card-icon">📍</span>
                        <h2>Venue</h2>
                        <p>Knotting Hill Place</p>
                        <p>2621 W Eldorado Pkwy, Little Elm, TX 75068</p>
                        {venueImage && (
                            <a
                                className="detail-card-media-link"
                                href={venueMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    className="detail-card-media"
                                    src={venueImage}
                                    alt="Knotting Hill Place venue"
                                    loading="lazy"
                                />
                            </a>
                        )}
                        <p>
                            <a
                                className="detail-card-link"
                                href={venueMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Google Maps
                            </a>
                            <p>Join us at Knotting Hill Place, an elegant North Texas estate venue known for its
                            beautiful interiors, landscaped grounds, and grand celebration spaces.</p>
                        </p>
                    </article>

                    <article className="detail-card">
                        <span className="card-icon">👔</span>
                        <h2>Dress Code</h2>
                        <p>Formal wedding attire. Traditional South Asian or western formalwear are both welcome.</p>
                    </article>

                    <article className="detail-card">
                        <span className="card-icon">✈️</span>
                        <h2>Travel</h2>
                        <p>Approximately 24 miles from DFW Airport for guests flying in.</p>
                        <p>The venue is conveniently located for local and out-of-town guests traveling into the area.</p>
                        <div className="event-static-notice">Travel Accomodations coming soon</div>
                    </article>

                    <article className="detail-card detail-card-wide event-timeline-card">
                        <span className="card-icon">🕐</span>
                        <h2>Event Timeline</h2>
                        <ol className="event-timeline">
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">5:30 PM</span>
                                <div className="timeline-content">
                                    <strong>Guest Arrival</strong>
                                    <p>Valet is provided for parking</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">6:00 PM</span>
                                <div className="timeline-content">
                                    <strong>Appetizers and Mocktails Served</strong>
                                    <p>Social hour</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">6:30 PM</span>
                                <div className="timeline-content">
                                    <strong>Pictures around the venue</strong>
                                    <p>Feel for to get your pictures taken</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">7:00 PM</span>
                                <div className="timeline-content">
                                    <strong>Maghrib Namaz</strong>
                                    <p>Join us for Maghrib Namaz</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">7:15 PM</span>
                                <div className="timeline-content">
                                    <strong>Arrival of Bride and Groom</strong>
                                    <p>Celebrate the beautiful entrance and welcome with speeches</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">7:30 PM</span>
                                <div className="timeline-content">
                                    <strong>Du'a for the couple</strong>
                                    <p>Quran recitation and du'a for the couple</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">7:45 PM</span>
                                <div className="timeline-content">
                                    <strong>Speeches and Welcome Remarks</strong>
                                    <p>Family and Friends give their speeches and welcome remarks</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">8:00 PM</span>
                                <div className="timeline-content">
                                    <strong>Dinner</strong>
                                    <p>Dinner is served in the ballroom</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">9:00 PM</span>
                                <div className="timeline-content">
                                    <strong>Pictures Opportunity with the couple</strong>
                                    <p>Capture special moments with the couple </p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">9:30 PM</span>
                                <div className="timeline-content">
                                    <strong>Fireworks in the courtyard</strong>
                                    <p>Watch our custom fireworks show</p>
                                </div>
                            </li>
                            <li className="timeline-item">
                                <span className="timeline-dot" />
                                <span className="timeline-time">10:00 PM</span>
                                <div className="timeline-content">
                                    <strong>Thank you and favors</strong>
                                    <p>Thank you for joining and your Blessings</p>
                                </div>
                            </li>
                        </ol>
                    </article>
                </section>
            </div>
        </div>
    );
}
