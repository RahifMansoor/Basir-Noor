import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Mehndi",
    description:
        "Template details for the Mehndi event, including dress code, location, date, mood, and activities.",
};

export default function MehndiPage() {
    return <EventTemplate event={eventDetails.mehndi} />;
}
