import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Welcome Bride",
    description:
        "Template details for the Welcome Bride event, including dress code, location, date, mood, and activities.",
};

export default function WelcomeBridePage() {
    return <EventTemplate event={eventDetails.welcomeBride} />;
}
