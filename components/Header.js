"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const disableBrandLink =
        pathname === "/save-the-date" ||
        pathname === "/welcome-bride" ||
        pathname === "/baat-pakki" ||
        pathname === "/barat" ||
        pathname === "/barat-save-the-date" ||
        pathname === "/details";

    const links = [
        { href: "/", label: "Home" },
        { href: "/baat-pakki", label: "Baat Pakki" },
        { href: "/details", label: "Details" },
        { href: "/rsvp", label: "RSVP" },
        { href: "/save-the-date", label: "Save The Date" },
    ];

    const hideNav =
        pathname === "/save-the-date" ||
        pathname === "/baat-pakki" ||
        pathname === "/barat-save-the-date";
    const visibleLinks =
        pathname === "/welcome-bride" || pathname === "/barat" || pathname === "/details"
            ? links.filter((link) => !["/", "/details", "/rsvp"].includes(link.href))
            : links;

    return (
        <header className="site-header">
            {disableBrandLink ? (
                <span className="brand">Basir & Noor</span>
            ) : (
                <Link className="brand" href="/">
                    Basir & Noor
                </Link>
            )}
            {!hideNav && (
                <nav className="site-nav">
                    {visibleLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? "active" : ""}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
