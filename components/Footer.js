"use client";

import { usePathname } from "next/navigation";

const footerMessages = {
    "/": "With love, Basir & Noor",
    "/details": "We cannot wait to celebrate with you.",
    "/rsvp": "Thank you for celebrating with us.",
    "/save-the-date": "October 18, 2026",
};

export default function Footer() {
    const pathname = usePathname();
    const message = footerMessages[pathname] || footerMessages["/"];

    return <footer className="site-footer">{message}</footer>;
}
