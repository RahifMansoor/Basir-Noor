"use client";

import { usePathname } from "next/navigation";

const footerMessages = {
    "/": "With love, Basir & Noor",
    "/baat-pakki": "Where it all began.",
    "/details": "We cannot wait to celebrate with you.",
    "/rsvp": "Thank you for celebrating with us.",
    "/welcome-bride": "Welcome to the family, Dulhan.",
    "/save-the-date": "October 18, 2026",
};

export default function Footer() {
    const pathname = usePathname();
    const message = footerMessages[pathname] || footerMessages["/"];

    return <footer className="site-footer">{message}</footer>;
}
