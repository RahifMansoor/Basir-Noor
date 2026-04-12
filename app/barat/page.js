import EventTemplate from "@/components/EventTemplate";
import { eventDetails } from "@/data/eventDetails";

export const metadata = {
    title: "Dulha Sehar Bandi & Nikkah",
    description:
        "Join us as Baraati for the Dulha Sehar Bandi and Nikkah — October 10, 2026 at Sheraton Nashua, NH.",
};

const hearts = [
    { left: "4%", top: "8%", size: "14px", delay: "0s", duration: "16s", driftX: "16vw", driftY: "22vh" },
    { left: "12%", top: "30%", size: "16px", delay: "1.6s", duration: "15s", driftX: "-15vw", driftY: "18vh" },
    { left: "18%", top: "68%", size: "13px", delay: "0.8s", duration: "17s", driftX: "20vw", driftY: "-18vh" },
    { left: "27%", top: "16%", size: "15px", delay: "3.2s", duration: "16.5s", driftX: "14vw", driftY: "26vh" },
    { left: "35%", top: "48%", size: "12px", delay: "1.1s", duration: "14.5s", driftX: "-18vw", driftY: "15vh" },
    { left: "44%", top: "10%", size: "17px", delay: "2.8s", duration: "18s", driftX: "18vw", driftY: "24vh" },
    { left: "52%", top: "58%", size: "14px", delay: "0.5s", duration: "16s", driftX: "-20vw", driftY: "-16vh" },
    { left: "60%", top: "22%", size: "16px", delay: "3.8s", duration: "18.5s", driftX: "16vw", driftY: "20vh" },
    { left: "68%", top: "76%", size: "13px", delay: "1.4s", duration: "15.5s", driftX: "-14vw", driftY: "-22vh" },
    { left: "76%", top: "36%", size: "15px", delay: "2.1s", duration: "17.5s", driftX: "19vw", driftY: "18vh" },
    { left: "84%", top: "14%", size: "12px", delay: "0.9s", duration: "15s", driftX: "-13vw", driftY: "24vh" },
    { left: "92%", top: "62%", size: "16px", delay: "3.4s", duration: "18s", driftX: "12vw", driftY: "-18vh" },
];

export default function BaratPage() {
    return (
        <div className="barat-romance-shell">
            <div className="barat-heart-layer" aria-hidden="true">
                {hearts.map((heart, index) => (
                    <span
                        key={index}
                        className="barat-floating-heart"
                        style={{
                            left: heart.left,
                            top: heart.top,
                            "--heart-size": heart.size,
                            "--heart-delay": heart.delay,
                            "--heart-duration": heart.duration,
                            "--heart-drift-x": heart.driftX,
                            "--heart-drift-y": heart.driftY,
                        }}
                    >
                        💖
                    </span>
                ))}
            </div>

            <div className="barat-page-content">
                <EventTemplate event={eventDetails.barat} />
            </div>
        </div>
    );
}
