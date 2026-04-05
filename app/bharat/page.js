import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Dulha Sehar Bandi & Nikkah",
    description:
        "Join us as Baraati for the Dulha Sehar Bandi and Nikkah — October 10, 2026 at Sheraton Nashua, NH.",
};

export default function BharatPage() {
    return <EventTemplate event={eventDetails.bharat} />;
}
