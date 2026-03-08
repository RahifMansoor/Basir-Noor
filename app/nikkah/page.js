import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Nikkah",
    description:
        "Template details for the Nikkah ceremony, including dress code, location, date, mood, and activities.",
};

export default function NikkahPage() {
    return <EventTemplate event={eventDetails.nikkah} />;
}
