"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const disableBrandLink =
        pathname === "/save-the-date" ||
        pathname === "/welcome-bride" ||
        pathname === "/barat" ||
        pathname === "/barat-save-the-date";

    const links = [
        { href: "/", label: "Home" },
        { href: "/baat-pakki", label: "Baat Pakki" },
        { href: "/walima", label: "Walima" },
        { href: "/rsvp", label: "RSVP" },
    ];

    const hideNav =
        pathname === "/save-the-date" ||
        pathname === "/baat-pakki" ||
        pathname === "/barat-save-the-date";
    const visibleLinks =
        pathname === "/dua-e-khair"
            ? links.filter((link) => link.href === "/baat-pakki")
            : pathname === "/welcome-bride" || pathname === "/barat" || pathname === "/walima"
            ? links.filter((link) => !["/", "/walima", "/rsvp", "/save-the-date"].includes(link.href))
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
