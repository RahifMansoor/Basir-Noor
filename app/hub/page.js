import Link from "next/link";

export const metadata = { title: "Hub" };

const hubLinks = [
    {
        href: "/hub/broadcast",
        icon: "📣",
        title: "Broadcast",
        desc: "Announcements and updates from the family.",
    },
    {
        href: "/hub/dream-team",
        icon: "🌟",
        title: "Dream Team",
        desc: "Meet the day-of contacts and helpers.",
    },
    {
        href: "/hub/gallery",
        icon: "📸",
        title: "Photo Gallery",
        desc: "Browse shared photos and add your own.",
    },
];

export default function HubPage() {
    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">For Everyone</p>
                <h1>The Hub</h1>
                <p>Announcements, the team behind the scenes, and a place to share your favorite moments.</p>
            </section>

            <section className="hub-landing-grid">
                {hubLinks.map((item) => (
                    <Link key={item.href} href={item.href} className="hub-landing-card">
                        <span className="hub-landing-icon">{item.icon}</span>
                        <h2>{item.title}</h2>
                        <p>{item.desc}</p>
                    </Link>
                ))}
            </section>
        </div>
    );
}
