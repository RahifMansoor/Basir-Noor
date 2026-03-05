export const metadata = {
    title: "Wedding Details",
    description:
        "Venue, schedule, dress code, and travel details for Basir & Noor's wedding on October 9, 2026.",
};

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
                    <p>October 9, 2026</p>
                    <p>Add ceremony and reception times here.</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">📍</span>
                    <h2>Venue</h2>
                    <p>Add your venue address here.</p>
                    <p>Directions and parking details will be provided closer to the date.</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">👔</span>
                    <h2>Dress Code</h2>
                    <p>Add your dress code guidance here.</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">🏨</span>
                    <h2>Accommodations</h2>
                    <p>Recommended hotels and travel arrangements for out-of-town guests.</p>
                </article>
            </div>
        </div>
    );
}
