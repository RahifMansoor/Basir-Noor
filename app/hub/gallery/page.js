import Link from "next/link";
import HubGallery from "@/components/HubGallery";

export const metadata = { title: "Hub Gallery" };

export default function HubGalleryPage() {
    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">The Hub</p>
                <h1>📸 Photo Gallery</h1>
                <p>Add your favorite moments and browse what everyone else has shared.</p>
            </section>

            <HubGallery />

            <div className="hub-back-link">
                <Link className="btn btn-outline" href="/hub">
                    ← Back to Hub
                </Link>
            </div>
        </div>
    );
}
