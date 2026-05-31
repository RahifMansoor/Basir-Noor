"use client";

import { usePathname } from "next/navigation";

const footerMessages = {
    "/": "With love, Basir & Noor",
    "/baat-pakki": "Where it all began.",
    "/walima": "We cannot wait to celebrate with you.",
    "/rsvp": "Thank you for celebrating with us.",
    "/welcome-bride": "Welcome to the family, Dulhan.",
    "/save-the-date": "October 18, 2026",
};

const FALLBACK_DRIVE = "https://drive.google.com/drive/folders/1Skqu1PNG6xgH-7VkMtapS_wRgguf-MTd?usp=sharing";

const driveLinks = {
    "/":               "https://drive.google.com/drive/folders/1l-eHA1QwOjr0QNkKaZlikd8VWdbw_BLF?usp=sharing",
    "/baat-pakki":     "https://drive.google.com/drive/folders/1l-eHA1QwOjr0QNkKaZlikd8VWdbw_BLF?usp=sharing",
    "/dholki":         "https://drive.google.com/drive/folders/16NnsL3adIPrNkHXoXbClVIaFr3VU6gBX?usp=sharing",
    "/mehndi":         "https://drive.google.com/drive/folders/1tlNAF4y2UmzlVSQLmKBXuC3P0U1h5vfj?usp=sharing",
    "/nikkah":         FALLBACK_DRIVE,
    "/barat":          "https://drive.google.com/drive/folders/1SboO0K2JpNdSj-S0l42A-TdSiQzU1-nS?usp=sharing",
    "/dua-e-khair":    "https://drive.google.com/drive/folders/1q2XV8YX-NXr4PcASKW3jotM2ZszlC7GK?usp=sharing",
    "/welcome-bride":  "https://drive.google.com/drive/folders/1_dVj8zT5wkpwFBWP20onZQRk7U32-DKW?usp=sharing",
    "/walima":         "https://drive.google.com/drive/folders/1l-eHA1QwOjr0QNkKaZlikd8VWdbw_BLF?usp=sharing",
    "/rsvp":           FALLBACK_DRIVE,
};

const noDriveBanner = new Set(["/rsvp", "/baat-pakki"]);

export default function Footer() {
    const pathname = usePathname();
    const message = footerMessages[pathname] || footerMessages["/"];
    const driveHref = driveLinks[pathname] || FALLBACK_DRIVE;
    const showBanner = !noDriveBanner.has(pathname);

    return (
        <footer className="site-footer">
            {showBanner && (
                <div className="footer-photos-banner">
                    <p className="footer-photos-heading">Share Your Photos</p>
                    <p className="footer-photos-sub">
                        Capture a special moment? Add your photos to our shared album and help us relive the celebration together.
                    </p>
                    <a
                        className="footer-photos-btn"
                        href={driveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Add Your Photos
                    </a>
                </div>
            )}
            <p className="footer-message">{message}</p>
        </footer>
    );
}
