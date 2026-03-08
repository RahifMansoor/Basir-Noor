import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Dholki",
    description:
        "Template details for the Dholki event, including dress code, location, date, mood, and activities.",
};

export default function DholkiPage() {
    return <EventTemplate event={eventDetails.dholki} />;
}
