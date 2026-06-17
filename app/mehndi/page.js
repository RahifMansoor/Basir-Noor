import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Mehndi",
    description:
        "Template details for the Mehndi event, including dress code, location, date, mood, and activities.",
};

export default function MehndiPage() {
    return (
        <>
            <div className="mehndi-ladies-banner">
                <span className="mehndi-ladies-icon">🌼</span>
                Ladies &amp; Girls Only
                <span className="mehndi-ladies-icon">🌼</span>
            </div>
            <EventTemplate event={eventDetails.mehndi} />
        </>
    );
}
