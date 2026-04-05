import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Welcome Dulhan",
    description:
        "Join us for the Welcome Dulhan celebration — a pre-Walima evening with a live singer, family toasts, and joyful moments.",
};

export default function WelcomeDulhanPage() {
    return <EventTemplate event={eventDetails.welcomeDulhan} />;
}
