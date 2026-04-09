
export default function DetailsPage() {
    return (
        <div className="content-page">
            <div className="details-hero">
                <h1>Wedding Details</h1>
                <p>Everything you need to know about our special day.</p>
            </div>

            <div className="details-grid">
                <article className="detail-card">
                    <span className="card-icon">📅</span>
                    <h2>Date & Time</h2>
                    <p>October 18th, 2026</p>
                    <p>Ceremony and reception times will be announced soon.</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">📍</span>
                    <h2>Venue</h2>
                    <p>Knotting Hill Place</p>
                    <p>2621 W Eldorado Pkwy, Little Elm, TX 75068</p>
                    <p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=2621+W+Eldorado+Pkwy,+Little+Elm,+TX+75068" target="_blank" rel="noopener noreferrer">
                            Get Directions
                        </a>
                    </p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">👔</span>
                    <h2>Dress Code</h2>
                    <p>Add your dress code guidance here.</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">🏨</span>
                    <h2>Accommodations</h2>
                    <p>Approximately 24 miles from DFW Airport.</p>
                    <p>Recommended hotels and travel arrangements for out-of-town guests will be provided closer to the date.</p>
                </article>
            </div>
        </div>
    );
}
