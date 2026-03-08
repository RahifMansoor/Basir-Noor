import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Bharat",
    description:
        "Template details for the Bharat event, including dress code, location, date, mood, and activities.",
};

export default function BharatPage() {
    return <EventTemplate event={eventDetails.bharat} />;
}
