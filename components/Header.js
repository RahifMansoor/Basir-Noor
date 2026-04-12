"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const disableBrandLink = pathname === "/save-the-date";

    const links = [
        { href: "/", label: "Home" },
        { href: "/baat-pakki", label: "Baat Pakki" },
        { href: "/details", label: "Details" },
        { href: "/rsvp", label: "RSVP" },
        { href: "/save-the-date", label: "Save The Date" },
    ];

    const hideNav = pathname === "/save-the-date" || pathname === "/baat-pakki";

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
                    {links.map((link) => (
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
